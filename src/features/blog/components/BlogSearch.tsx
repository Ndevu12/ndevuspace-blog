"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

interface BlogSearchProps {
  onSearch: (query: string) => void;
  searchQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function BlogSearch({
  onSearch,
  searchQuery: externalSearchQuery = "",
  placeholder = "Search articles by keyword or topic…",
  autoFocus = false,
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
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-full border-border bg-card/60 pl-12 pr-14 text-base shadow-none backdrop-blur-md transition-[border-color,box-shadow] duration-200 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/30"
      />
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
