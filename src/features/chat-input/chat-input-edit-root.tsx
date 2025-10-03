import {
  useState,
  useCallback,
  type ReactNode,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { ChatInputContext } from "./context";
import { useAutoResizeTextarea } from "./hooks/use-auto-resize-textarea";
import { DEFAULT_MODEL, type ModelConfig } from "@/features/models";

export interface ChatInputEditRootProps {
  children: ReactNode;
  initialText: string;
  initialModel?: ModelConfig;
  onSubmit: (text: string) => void;
}

export const ChatInputEditRoot = ({
  children,
  initialText,
  initialModel,
  onSubmit,
}: ChatInputEditRootProps) => {
  const [inputText, setInputText] = useState(initialText);

  const [selectedModel, setSelectedModel] = useState<ModelConfig>(
    initialModel || DEFAULT_MODEL,
  );

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 64,
    maxHeight: 192,
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
    chatInputContainerRef: { current: null }, // Not needed for editing
    handleSubmit,
    handleChange,
    handleKeyDown,
    setSelectedModel,
    onSubmit,
    showScrollToBottom: false, // No scroll button in edit mode
    onScrollToBottom: undefined,
  };

  return (
    <ChatInputContext.Provider value={contextValue}>
      {children}
    </ChatInputContext.Provider>
  );
};

ChatInputEditRoot.displayName = "ChatInputEdit.Root";
