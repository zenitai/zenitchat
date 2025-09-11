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
import type { ModelConfig } from "@/config/ai-models/types";
import { DEFAULT_MODEL } from "@/config/ai-models";

export type ChatInputProps = Omit<
  ComponentProps<typeof ChatInputForm>,
  "onSubmit"
> & {
  onSubmit: (text: string) => void;
  onHeightChange?: (height: number) => void;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
  disabled?: boolean;
  selectedModel?: ModelConfig;
  onModelSelect?: (model: ModelConfig) => void;
};

export const ChatInput = ({
  onSubmit,
  onHeightChange,
  showScrollToBottom,
  onScrollToBottom,
  disabled = false,
  selectedModel,
  onModelSelect,
  ...props
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [internalSelectedModel, setInternalSelectedModel] = useState<
    ModelConfig | undefined
  >(selectedModel || DEFAULT_MODEL);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 64,
    maxHeight: 192,
  });

  // Chat input container height management
  const { chatInputContainerRef } = useChatInputHeight({
    onHeightChange: onHeightChange || (() => {}),
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

  const handleModelSelect = (model: ModelConfig) => {
    setInternalSelectedModel(model);
    onModelSelect?.(model);
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
                <ModelSelector
                  selectedModel={internalSelectedModel}
                  onModelSelect={handleModelSelect}
                  disabled={disabled}
                />
                <ChatInputButton variant="outline">
                  <PaperclipIcon className="size-4" />
                </ChatInputButton>
                <ChatInputButton variant="outline">
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
