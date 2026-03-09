"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface BlogSearchProps {
  onSearch: (query: string) => void;
  searchQuery?: string;
  placeholder?: string;
}

export function BlogSearch({
  onSearch,
  searchQuery: externalSearchQuery = "",
  placeholder = "Search articles by keyword or topic...",
}: BlogSearchProps) {
  const [query, setQuery] = useState(externalSearchQuery);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state with external search query changes
  useEffect(() => {
    setQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    onSearch(query.trim());
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="flex rounded-lg overflow-hidden shadow-lg border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-300">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-grow border-0 rounded-none py-6 px-5 bg-background/80 backdrop-blur-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="lg"
            className="rounded-none px-6"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
