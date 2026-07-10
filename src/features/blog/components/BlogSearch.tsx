"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/shared/CommandPalette";
import { ArrowRight, Search } from "lucide-react";

interface BlogSearchProps {
  onSearch: (query: string) => void;
  searchQuery?: string;
  placeholder?: string;
}

export function BlogSearch({
  onSearch,
  searchQuery: externalSearchQuery = "",
  placeholder = "Search articles by keyword or topic…",
}: BlogSearchProps) {
  const [query, setQuery] = useState(externalSearchQuery);

  // Sync internal state when the external query changes (URL navigation,
  // clear-search) — adjusted during render instead of via an effect.
  const [prevExternalQuery, setPrevExternalQuery] = useState(externalSearchQuery);
  if (externalSearchQuery !== prevExternalQuery) {
    setPrevExternalQuery(externalSearchQuery);
    setQuery(externalSearchQuery);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="relative mx-auto max-w-2xl"
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-full border-border bg-card/60 pl-12 pr-14 text-base shadow-none backdrop-blur-md transition-[border-color,box-shadow] duration-200 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/30 md:pr-24"
      />
      <button
        type="button"
        aria-label="Open command palette"
        onClick={() =>
          window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))
        }
        className="pressable absolute right-14 top-1/2 hidden -translate-y-1/2 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:text-primary md:block"
      >
        ⌘K
      </button>
      <Button
        type="submit"
        size="icon"
        aria-label="Search"
        className="pressable absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full transition-transform"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
