import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type ChatInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const ChatInputToolbar = ({
  className,
  ...props
}: ChatInputToolbarProps) => (
  <div
    className={cn("flex items-center justify-between p-1", className)}
    {...props}
  />
);

export type ChatInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const ChatInputTools = ({
  className,
  ...props
}: ChatInputToolsProps) => (
  <div className={cn("flex items-center gap-2", className)} {...props} />
);
