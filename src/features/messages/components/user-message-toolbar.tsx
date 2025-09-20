import CopyButton from "@/components/ui/copy-button";
import { formatMessageContent } from "../utils";
import type { MyUIMessage } from "../types";

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
    <div className={`flex items-center gap-1 ${className}`}>
      <CopyButton
        content={formattedContent}
        showToast
        ariaLabel="Copy message"
      />
    </div>
  );
}
