import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ComponentProps, MouseEvent } from "react";
import { SquareIcon, ArrowUpIcon } from "lucide-react";
import { useChatStatus, useChatActions } from "@ai-sdk-tools/store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const status = useChatStatus();
  const { stop } = useChatActions();
  const isBusy = status === "submitted" || status === "streaming";

  let Icon = <ArrowUpIcon className="size-4" />;

  if (isBusy) {
    Icon = <SquareIcon className="size-4" />;
  }

  const getTooltipText = () => {
    if (isBusy) return "Stop generating";
    return "Send message";
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isBusy) {
      e.preventDefault();
      e.stopPropagation();
      stop();
    }
    onClick?.(e);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("gap-1.5 rounded-lg", className)}
          size={size}
          type={isBusy ? "button" : "submit"}
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
