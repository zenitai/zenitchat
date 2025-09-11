import { useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-3">
      <div className="flex items-center border-b">
        <Search
          aria-hidden="true"
          className="-ml-[3px] mr-3 !size-4 min-w-4 text-muted-foreground"
        />
        <Input
          id="model-search"
          name="model-search"
          type="text"
          aria-label={placeholder}
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
          ref={inputRef}
          className="!bg-transparent !px-0 py-2 text-sm text-foreground border-none shadow-none !ring-0 placeholder:text-muted-foreground/50 placeholder:select-none focus:outline-none"
        />
      </div>
    </div>
  );
};
