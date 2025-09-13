import { forwardRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputTextareaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput?: () => void;
  placeholder?: string;
  className?: string;
}

export const ChatInputTextarea = forwardRef<
  HTMLTextAreaElement,
  ChatInputTextareaProps
>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onInput,
      placeholder = "Enter your query here...",
      className = "",
    },
    ref,
  ) => {
    const handleInput = () => {
      onInput?.();
    };

    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        name="message"
        autoComplete="off"
        className={cn(
          "!bg-transparent resize-none rounded-none border-none shadow-none leading-6 custom-scrollbar focus-visible:ring-0 focus-visible:outline-none",
          className,
        )}
      />
    );
  },
);

ChatInputTextarea.displayName = "ChatInputTextarea";
