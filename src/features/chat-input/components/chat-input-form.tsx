import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type ChatInputFormProps = HTMLAttributes<HTMLFormElement>;

export const ChatInputForm = ({ className, ...props }: ChatInputFormProps) => (
  <form
    className={cn(
      "w-full divide-y overflow-hidden rounded-t-md border-t border-l border-r bg-background shadow-sm flex flex-col gap-2 px-3 pt-3 pb-safe-offset-3",
      className,
    )}
    {...props}
  />
);
