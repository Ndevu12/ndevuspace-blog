"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Loader2,
  Newspaper,
  Plus,
  Tag,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDebouncedValue } from "@/hooks";
import {
  getBlogsPaginated,
  searchBlogsByTitle,
} from "@/features/blog/services/resolvedBlogService";
import type { BlogPost } from "@/types/blog";

const SEARCH_MIN_CHARS = 2;
const RECENT_POSTS_LIMIT = 5;
const SEARCH_RESULTS_LIMIT = 8;

/** Dispatch on window to open the palette from anywhere (e.g. a header button). */
export const OPEN_COMMAND_PALETTE_EVENT = "ndevuspace:open-command-palette";

const DASHBOARD_NAV = [
  { label: "Dashboard overview", href: "/dashboard", Icon: LayoutDashboard },
  { label: "All blogs", href: "/dashboard/blogs", Icon: FileText },
  { label: "New blog", href: "/dashboard/blogs/new", Icon: Plus },
  { label: "Categories", href: "/dashboard/categories", Icon: Tag },
] as const;

/**
 * Dashboard ⌘K palette: jump to dashboard views, recent posts, or any
 * published article via server-driven search. Post search is debounced and
 * remote, so cmdk's own filtering is off; article selection opens the
 * published page.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [results, setResults] = useState<BlogPost[]>([]);
  // Query the current `results` belong to — searching/showing is derived.
  const [resultsQuery, setResultsQuery] = useState("");
  const staticLoadedRef = useRef(false);

  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const isSearchActive = debouncedQuery.length >= SEARCH_MIN_CHARS;
  const searchResults =
    isSearchActive && resultsQuery === debouncedQuery ? results : [];
  const searching = isSearchActive && resultsQuery !== debouncedQuery;

  // ⌘K / Ctrl+K toggle + programmatic open event
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  // Load recent posts once, on first open
  useEffect(() => {
    if (!open || staticLoadedRef.current) return;
    staticLoadedRef.current = true;

    getBlogsPaginated(1, RECENT_POSTS_LIMIT)
      .then((recent) => setRecentPosts(recent.blogs))
      .catch(() => {
        // Palette stays usable with navigation items only.
      });
  }, [open]);

  // Server-driven post search — state updates happen only in async callbacks
  useEffect(() => {
    if (!isSearchActive) return;

    let cancelled = false;
    searchBlogsByTitle(debouncedQuery, 1, SEARCH_RESULTS_LIMIT)
      .then((response) => {
        if (cancelled) return;
        setResults(response.blogs);
        setResultsQuery(debouncedQuery);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setResultsQuery(debouncedQuery);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isSearchActive]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const matchingNav = isSearchActive
    ? DASHBOARD_NAV.filter((item) =>
        item.label.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : DASHBOARD_NAV;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search articles and dashboard views"
    >
      <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search articles, dashboard views…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </span>
          ) : (
            "No results found."
          )}
        </CommandEmpty>

        {searchResults.length > 0 && (
          <CommandGroup heading="Articles">
            {searchResults.map((post) => (
              <CommandItem
                key={post.id}
                value={`post-${post.id}`}
                onSelect={() => navigate(`/blog/${post.slug}`)}
              >
                <FileText aria-hidden />
                <span className="truncate">{post.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isSearchActive && recentPosts.length > 0 && (
          <CommandGroup heading="Recent articles">
            {recentPosts.map((post) => (
              <CommandItem
                key={post.id}
                value={`recent-${post.id}`}
                onSelect={() => navigate(`/blog/${post.slug}`)}
              >
                <Newspaper aria-hidden />
                <span className="truncate">{post.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchingNav.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Dashboard">
              {matchingNav.map(({ label, href, Icon }) => (
                <CommandItem
                  key={href}
                  value={`nav-${href}`}
                  onSelect={() => navigate(href)}
                >
                  <Icon aria-hidden />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
