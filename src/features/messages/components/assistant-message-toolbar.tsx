import CopyButton from "@/components/ui/copy-button";
import { formatMessageContent } from "../utils";
import type { MyUIMessage } from "../types";
import { cn } from "@/lib/utils";

interface AssistantMessageToolbarProps {
  parts: MyUIMessage["parts"];
  className?: string;
}

export function AssistantMessageToolbar({
  parts,
  className,
}: AssistantMessageToolbarProps) {
  // Check if any part is still streaming
  const isStreaming = parts.some(
    (part) => "state" in part && part.state === "streaming",
  );

  // Don't show copy button during streaming
  if (isStreaming) {
    return null;
  }

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
