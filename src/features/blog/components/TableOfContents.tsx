"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const articleContent = document.querySelector("[data-article-content]");
    if (!articleContent) {
      setTocItems([]);
      setActiveId("");
      setHasCompletedInitialScan(true);
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
      setActiveId("");
      return;
    }

    const headings = tocItems
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => heading !== null);

    if (headings.length === 0) {
      setActiveId("");
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
      <Card className={`sticky top-24 ${className}`}>
        <CardHeader className="pb-2">
          <h3 className="font-bold flex items-center">
            <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
            Table of Contents
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Loading table of contents...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tocItems.length === 0) {
    return (
      <Card className={`sticky top-24 ${className}`}>
        <CardHeader className="pb-2">
          <h3 className="font-bold flex items-center">
            <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
            Table of Contents
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sections available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`sticky top-24 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center">
            <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
            Table of Contents
          </h3>
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
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className={`${isCollapsed ? "hidden lg:block" : "block"}`}
        >
          <nav className="space-y-1 text-sm max-h-[60vh]">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTocClick(item.id)}
                className={`
                  block w-full text-left py-2 border-l-2 transition-all duration-200
                  ${item.level === 2 ? "pl-4" : "pl-6 text-xs"}
                  ${
                    activeId === item.id
                      ? "text-primary border-primary bg-primary/10"
                      : "text-muted-foreground border-border hover:text-primary hover:border-primary"
                  }
                `}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
