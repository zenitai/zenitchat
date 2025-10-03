import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChatInputContext } from "../context";

export interface ChatInputTextareaProps {
  placeholder?: string;
  className?: string;
}

export const ChatInputTextarea = ({
  placeholder = "Enter your query here...",
  className = "",
}: ChatInputTextareaProps) => {
  const { inputText, textareaRef, handleChange, handleKeyDown } =
    useChatInputContext();

  return (
    <Textarea
      ref={textareaRef}
      value={inputText}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      name="message"
      autoComplete="off"
      className={cn(
        "!bg-transparent resize-none rounded-none border-none shadow-none leading-6 custom-scrollbar focus-visible:ring-0 focus-visible:outline-none",
        className,
      )}
    />
  );
};

ChatInputTextarea.displayName = "ChatInput.Textarea";
