import { useState } from "react";
import type { ComponentProps, ChangeEvent, KeyboardEvent } from "react";
import { PaperclipIcon, GlobeIcon } from "lucide-react";
import { ChatInputForm } from "./components/chat-input-form";
import { ChatInputTextarea } from "./components/chat-input-textarea";
import { ChatInputToolbar } from "./components/chat-input-toolbar";
import { ChatInputTools } from "./components/chat-input-toolbar";
import { ChatInputButton } from "./components/chat-input-button";
import { ChatInputSubmit } from "./components/chat-input-submit";
import { ScrollToBottomButton } from "./components/scroll-to-bottom-button";
import { useAutoResizeTextarea } from "./hooks/use-auto-resize-textarea";
import { useChatInputHeight } from "./hooks/use-chat-input-height";
import { ModelSelector } from "./model-selector/model-selector";

export type ChatInputProps = Omit<
  ComponentProps<typeof ChatInputForm>,
  "onSubmit"
> & {
  onSubmit: (text: string) => void;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
  disabled?: boolean;
};

export const ChatInput = ({
  onSubmit,
  showScrollToBottom,
  onScrollToBottom,
  disabled = false,
  ...props
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 64,
    maxHeight: 192,
  });

  // Chat input container height management
  const { chatInputContainerRef } = useChatInputHeight({
    currentValue: input,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput("");
      // Reset height after clearing
      adjustHeight(true);
    }
  };

  const handleInput = () => {
    adjustHeight();
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      // Don't submit if IME composition is in progress
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.shiftKey) {
        // Allow newline
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col">
        <ScrollToBottomButton
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={onScrollToBottom}
        />
        <div ref={chatInputContainerRef} className="pointer-events-auto">
          <ChatInputForm onSubmit={handleSubmit} {...props}>
            <ChatInputTextarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
            />
            <ChatInputToolbar>
              <ChatInputTools>
                <ModelSelector disabled={disabled} />
                <ChatInputButton variant="outline" aria-label="Attach file">
                  <PaperclipIcon className="size-4" />
                </ChatInputButton>
                <ChatInputButton variant="outline" aria-label="Search web">
                  <GlobeIcon className="size-4" />
                </ChatInputButton>
              </ChatInputTools>
              <ChatInputTools>
                <ChatInputSubmit disabled={disabled} />
              </ChatInputTools>
            </ChatInputToolbar>
          </ChatInputForm>
        </div>
      </div>
    </div>
  );
};
