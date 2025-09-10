import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentProps } from "react";
import { Loader2Icon, SquareIcon, XIcon, ArrowUpIcon } from "lucide-react";
import type { ChatStatus } from "ai";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ChatInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus;
};

export const ChatInputSubmit = ({
  className,
  variant = "default",
  size = "icon",
  status,
  children,
  ...props
}: ChatInputSubmitProps) => {
  let Icon = <ArrowUpIcon className="size-4" />;

  if (status === "submitted") {
    Icon = <Loader2Icon className="size-4 animate-spin" />;
  } else if (status === "streaming") {
    Icon = <SquareIcon className="size-4" />;
  } else if (status === "error") {
    Icon = <XIcon className="size-4" />;
  }

  const getTooltipText = () => {
    if (status === "submitted") return "Sending...";
    if (status === "streaming") return "Stop generating";
    if (status === "error") return "Retry";
    return "Send message";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("gap-1.5 rounded-lg", className)}
          size={size}
          type="submit"
          variant={variant}
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
