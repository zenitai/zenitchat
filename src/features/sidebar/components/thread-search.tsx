import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function ThreadSearch() {
  return (
    <div className="border-b px-3">
      <div className="flex items-center">
        <Search className="size-4 min-w-4 text-muted-foreground" />
        <Input
          id="thread-search"
          name="thread-search"
          role="threadsearch"
          aria-label="Search your threads..."
          placeholder="Search your threads..."
          className="!bg-transparent py-2 text-sm text-foreground border-none shadow-none !ring-0"
        />
      </div>
    </div>
  );
}
