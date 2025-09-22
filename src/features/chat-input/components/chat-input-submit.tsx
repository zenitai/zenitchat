import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentProps } from "react";
import { SquareIcon, ArrowUpIcon } from "lucide-react";
import { useChatStatus, useChatActions } from "@ai-sdk-tools/store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ChatInputSubmitProps = ComponentProps<typeof Button>;

export const ChatInputSubmit = ({
  className,
  variant = "default",
  size = "icon",
  children,
  ...props
}: ChatInputSubmitProps) => {
  const status = useChatStatus();
  const { stop } = useChatActions();
  let Icon = <ArrowUpIcon className="size-4" />;

  if (status === "submitted" || status === "streaming") {
    Icon = <SquareIcon className="size-4" />;
  }

  const getTooltipText = () => {
    if (status === "submitted" || status === "streaming")
      return "Stop generating";
    return "Send message";
  };

  const handleClick = () => {
    if (status === "submitted" || status === "streaming") {
      stop();
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
