import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ComponentProps, MouseEvent } from "react";
import { ArrowUpIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStreamingStatus } from "@/features/chat/hooks/use-streaming-status";
import { stopMessage } from "@/features/chat/stop-message";
import { useChatInputContext } from "../context";

export type ChatInputSubmitProps = ComponentProps<typeof Button> & {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const ChatInputSubmit = ({
  className,
  variant = "default",
  size = "icon",
  children,
  onClick,
  ...props
}: ChatInputSubmitProps) => {
  const { threadId } = useChatInputContext();
  const status = useStreamingStatus(threadId ?? "");
  const isStreaming = status === "streaming" || status === "submitted";

  const Icon = isStreaming ? (
    <div className="size-4 bg-current rounded-[2px]" />
  ) : (
    <ArrowUpIcon className="size-5 stroke-2" />
  );

  const getTooltipText = () => {
    return isStreaming ? "Stop generation" : "Send message";
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isStreaming && threadId) {
      e.preventDefault();
      stopMessage(threadId);
    } else {
      onClick?.(e);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("gap-1.5 rounded-lg", className)}
          size={size}
          type="submit"
          variant={variant}
          aria-label={getTooltipText()}
          onClick={handleClick}
          {...props}
        >
          {children ?? Icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  );
};
