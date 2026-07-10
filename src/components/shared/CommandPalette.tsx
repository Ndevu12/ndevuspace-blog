"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, LayoutGrid, Loader2, Newspaper, Tag } from "lucide-react";
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
  getAllBlogCategories,
  getBlogsPaginated,
  searchBlogsByTitle,
} from "@/features/blog/services/resolvedBlogService";
import type { BlogCategory, BlogPost } from "@/types/blog";

const SEARCH_MIN_CHARS = 2;
const RECENT_POSTS_LIMIT = 5;
const SEARCH_RESULTS_LIMIT = 8;

/** Dispatch on window to open the palette from anywhere (e.g. search-pill hint). */
export const OPEN_COMMAND_PALETTE_EVENT = "ndevuspace:open-command-palette";

/**
 * Global ⌘K palette: jump to posts and categories from anywhere.
 * Static data (categories, recent posts) loads once on first open; post
 * search is server-driven and debounced, so cmdk's own filtering is off.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
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

  // Load categories + recent posts once, on first open
  useEffect(() => {
    if (!open || staticLoadedRef.current) return;
    staticLoadedRef.current = true;

    Promise.all([
      getAllBlogCategories(),
      getBlogsPaginated(1, RECENT_POSTS_LIMIT),
    ])
      .then(([cats, recent]) => {
        setCategories(cats);
        setRecentPosts(recent.blogs);
      })
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

  const matchingCategories = isSearchActive
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : categories;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search articles and categories"
    >
      <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search articles, categories…"
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

        {matchingCategories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Categories">
              {matchingCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={`category-${category.id}`}
                  onSelect={() =>
                    navigate(
                      `/blog?category=${encodeURIComponent(category.name)}`
                    )
                  }
                >
                  <Tag aria-hidden />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!isSearchActive && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem value="nav-blog" onSelect={() => navigate("/blog")}>
                <LayoutGrid aria-hidden />
                All articles
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
