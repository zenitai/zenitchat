import { useState, useRef } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ThreadSearch() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="border-b px-3">
      <div className="flex items-center">
        <Search
          aria-hidden="true"
          className="-ml-[3px] mr-3 !size-4 min-w-4 text-muted-foreground"
        />
        <Input
          id="thread-search"
          name="thread-search"
          type="text"
          aria-label="Search your threads..."
          placeholder="Search your threads..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              clearQuery();
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          ref={inputRef}
          className="!bg-transparent !px-0 py-2 text-sm text-foreground border-none shadow-none !ring-0 placeholder:text-muted-foreground/50 placeholder:select-none focus:outline-none"
        />
        {query.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={clearQuery}
            className="ml-2 text-muted-foreground hover:bg-muted/40 !h-auto !w-auto !p-1"
            aria-label="Clear search"
          >
            <X aria-hidden="true" className="size-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
