"use client";

import { useEffect, useState } from "react";
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

export function TableOfContents({ className = "" }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const generateTOC = () => {
      const articleContent =
        document.querySelector(".prose") ||
        document.querySelector("article") ||
        document.querySelector("main");

      if (!articleContent) return;

      const headings = articleContent.querySelectorAll("h2, h3");
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        if (!heading.id) {
          heading.id =
            heading.textContent?.toLowerCase().replace(/[^\w]+/g, "-") ||
            `heading-${index}`;
        }

        items.push({
          id: heading.id,
          text: heading.textContent || "",
          level: parseInt(heading.tagName.charAt(1)),
        });
      });

      setTocItems(items);
    };

    const setupObserver = () => {
      const headings = document.querySelectorAll(
        ".prose h2, .prose h3, article h2, article h3, main h2, main h3"
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
      );

      headings.forEach((heading) => observer.observe(heading));

      return () => {
        headings.forEach((heading) => observer.unobserve(heading));
      };
    };

    // Delay to ensure content is rendered
    const timer = setTimeout(() => {
      generateTOC();
      setupObserver();
    }, 500);

    const fallbackTimer = setTimeout(() => {
      if (tocItems.length === 0) generateTOC();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [tocItems.length]);

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
          <p className="text-sm text-muted-foreground">
            Loading table of contents...
          </p>
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
