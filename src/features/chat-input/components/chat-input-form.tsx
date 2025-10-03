import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useChatInputContext } from "../context";

export interface ChatInputFormProps {
  children: ReactNode;
  className?: string;
}

export const ChatInputForm = ({ children, className }: ChatInputFormProps) => {
  const { handleSubmit } = useChatInputContext();

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full divide-y overflow-hidden rounded-t-md border-t border-l border-r bg-background shadow-sm flex flex-col gap-2 px-3 pt-3 pb-safe-offset-3",
        className,
      )}
    >
      {children}
    </form>
  );
};

ChatInputForm.displayName = "ChatInput.Form";
