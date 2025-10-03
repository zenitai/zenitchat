import {
  useState,
  useCallback,
  type ReactNode,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { ChatInputContext } from "./context";
import { useChatInputActions, useSelectedModel } from "./store";
import { useAutoResizeTextarea } from "./hooks/use-auto-resize-textarea";
import { useChatInputHeight } from "./hooks/use-chat-input-height";

export interface ChatInputRootProps {
  children: ReactNode;
  onSubmit: (text: string) => void;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
}

export const ChatInputRoot = ({
  children,
  onSubmit,
  showScrollToBottom,
  onScrollToBottom,
}: ChatInputRootProps) => {
  // Use LOCAL state instead of Zustand for input text (performance!)
  const [inputText, setInputText] = useState("");
  const { setSelectedModel } = useChatInputActions();
  const selectedModel = useSelectedModel();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 64,
    maxHeight: 192,
  });

  // Chat input container height management
  const { chatInputContainerRef } = useChatInputHeight({
    currentValue: inputText,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputText.trim()) {
      onSubmit(inputText.trim());
      setInputText(""); // Clear local state
      // Reset height after clearing
      adjustHeight(true);
    }
  };

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
      adjustHeight();
    },
    [adjustHeight],
  );

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

  const contextValue = {
    inputText,
    selectedModel,
    textareaRef,
    chatInputContainerRef,
    handleSubmit,
    handleChange,
    handleKeyDown,
    setSelectedModel,
    onSubmit,
    showScrollToBottom,
    onScrollToBottom,
  };

  return (
    <ChatInputContext.Provider value={contextValue}>
      {children}
    </ChatInputContext.Provider>
  );
};

ChatInputRoot.displayName = "ChatInput.Root";
