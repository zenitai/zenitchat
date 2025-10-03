import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ComponentProps, MouseEvent } from "react";
import { ArrowUpIcon } from "lucide-react";
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
  const Icon = <ArrowUpIcon className="size-4" />;

  const getTooltipText = () => {
    return "Send message";
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
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
