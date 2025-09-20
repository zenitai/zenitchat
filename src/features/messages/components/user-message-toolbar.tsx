import CopyButton from "@/components/ui/copy-button";
import { formatMessageContent } from "../utils";
import type { MyUIMessage } from "../types";
import { cn } from "@/lib/utils";

interface UserMessageToolbarProps {
  parts: MyUIMessage["parts"];
  className?: string;
}

export function UserMessageToolbar({
  parts,
  className,
}: UserMessageToolbarProps) {
  const formattedContent = formatMessageContent(parts);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <CopyButton
        content={formattedContent}
        showToast
        ariaLabel="Copy message"
        variant="ghost"
      />
    </div>
  );
}
