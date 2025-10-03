import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ModelSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ModelSearch = ({
  value,
  onChange,
  placeholder = "Search models...",
}: ModelSearchProps) => {
  return (
    <div className="absolute inset-x-0 top-0 rounded-t-lg bg-popover px-3.5 pt-0.5">
      <div className="flex items-center">
        <Search className="ml-px mr-1.5 !size-4 text-muted-foreground/75" />
        <Input
          id="model-search-input"
          name="modelSearch"
          role="searchbox"
          aria-label="Search models"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onChange("");
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full !bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none border-none shadow-none ring-0"
        />
      </div>
      <div className="border-b border-chat-border px-3"></div>
    </div>
  );
};
