"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

const slugifyHeadingText = (text: string): string => {
  return (
    text
      .trim()
      .toLowerCase()
      // Strip diacritics for stable ASCII-friendly anchors.
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace non-alphanumeric runs with hyphens.
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
};

const getUniqueHeadingId = (baseId: string, usedIds: Set<string>): string => {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId);
    return baseId;
  }

  let suffix = 2;
  let candidate = `${baseId}-${suffix}`;
  while (usedIds.has(candidate)) {
    suffix += 1;
    candidate = `${baseId}-${suffix}`;
  }

  usedIds.add(candidate);
  return candidate;
};

export function TableOfContents({ className = "" }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hasCompletedInitialScan, setHasCompletedInitialScan] = useState(false);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const headingObserverRef = useRef<IntersectionObserver | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const instanceId = useId();
  const railLayoutId = prefersReducedMotion
    ? undefined
    : `${instanceId}-toc-rail`;

  useEffect(() => {
    const articleContent = document.querySelector("[data-article-content]");
    if (!articleContent) {
      queueMicrotask(() => {
        setTocItems([]);
        setActiveId("");
        setHasCompletedInitialScan(true);
      });
      return;
    }

    const scanHeadings = () => {
      const headings = articleContent.querySelectorAll("h2, h3");
      const items: TocItem[] = [];
      const usedIds = new Set<string>();

      headings.forEach((heading, index) => {
        if (!heading.id) {
          const headingText = heading.textContent ?? "";
          const baseId = slugifyHeadingText(headingText) || `heading-${index + 1}`;
          heading.id = getUniqueHeadingId(baseId, usedIds);
        } else {
          usedIds.add(heading.id);
        }

        items.push({
          id: heading.id,
          text: heading.textContent || "",
          level: parseInt(heading.tagName.charAt(1), 10),
        });
      });

      setTocItems(items);
      setHasCompletedInitialScan(true);
    };

    // Deterministic initial scan on mount.
    scanHeadings();

    // Rescan if article HTML is replaced/hydrated after mount.
    let rafId: number | null = null;
    mutationObserverRef.current?.disconnect();
    mutationObserverRef.current = new MutationObserver(() => {
      // Coalesce clustered mutations into a single scan.
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(() => {
        scanHeadings();
      });
    });
    mutationObserverRef.current.observe(articleContent, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      mutationObserverRef.current?.disconnect();
      mutationObserverRef.current = null;
    };
  }, []);

  useEffect(() => {
    headingObserverRef.current?.disconnect();
    headingObserverRef.current = null;

    if (tocItems.length === 0) {
      queueMicrotask(() => setActiveId(""));
      return;
    }

    const headings = tocItems
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => heading !== null);

    if (headings.length === 0) {
      queueMicrotask(() => setActiveId(""));
      return;
    }

    headingObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((heading) => headingObserverRef.current?.observe(heading));

    return () => {
      headingObserverRef.current?.disconnect();
      headingObserverRef.current = null;
    };
  }, [tocItems]);

  const handleTocClick = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 100, behavior: "smooth" });

      // Collapse on mobile after click
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    }
  };

  if (!hasCompletedInitialScan) {
    return (
      <TocShell className={className}>
        <p className="text-sm text-muted-foreground">
          Loading table of contents...
        </p>
      </TocShell>
    );
  }

  if (tocItems.length === 0) {
    return (
      <TocShell className={className}>
        <p className="text-sm text-muted-foreground">No sections available.</p>
      </TocShell>
    );
  }

  return (
    <TocShell
      className={className}
      action={
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle table of contents"
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      }
    >
      <ScrollArea className={isCollapsed ? "hidden lg:block" : "block"}>
        <nav
          aria-label="Table of contents"
          className="space-y-0.5 text-[13px] max-h-[60vh]"
        >
          {tocItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTocClick(item.id)}
              className={cn(
                "relative block w-full border-l-2 border-border py-1.5 text-left leading-snug transition-colors duration-200",
                item.level === 2 ? "pl-3.5" : "pl-6 text-xs",
                activeId === item.id
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeId === item.id && (
                <motion.span
                  aria-hidden
                  layoutId={railLayoutId}
                  transition={SPRING_SNAPPY}
                  className="absolute -left-0.5 inset-y-0 w-0.5 bg-primary"
                />
              )}
              {item.text}
            </button>
          ))}
        </nav>
      </ScrollArea>
    </TocShell>
  );
}

/** Shared card frame for every TOC state (loading, empty, populated). */
function TocShell({
  className,
  action,
  children,
}: {
  className?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("sticky top-24", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-eyebrow">On this page</h3>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
