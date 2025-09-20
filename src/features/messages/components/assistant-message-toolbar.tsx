import CopyButton from "@/components/ui/copy-button";
import { formatMessageContent } from "../utils";
import type { MyUIMessage } from "../types";

interface AssistantMessageToolbarProps {
  parts: MyUIMessage["parts"];
  className?: string;
}

export function AssistantMessageToolbar({
  parts,
  className,
}: AssistantMessageToolbarProps) {
  const formattedContent = formatMessageContent(parts);

  // Check if any part is still streaming
  const isStreaming = parts.some(
    (part) => "state" in part && part.state === "streaming",
  );

  // Don't show copy button during streaming
  if (isStreaming) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <CopyButton
        content={formattedContent}
        showToast
        ariaLabel="Copy message"
        variant="ghost"
      />
    </div>
  );
}
