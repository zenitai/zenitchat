import {
  createContext,
  useContext,
  type RefObject,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { ModelConfig } from "@/features/models";

export interface ChatInputContextValue {
  // State
  inputText: string;
  selectedModel: ModelConfig;

  // Refs
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  chatInputContainerRef: RefObject<HTMLDivElement | null>;

  // Handlers
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  setSelectedModel: (model: ModelConfig) => void;

  // Callbacks from parent
  onSubmit:
    | ((text: string) => void)
    | ((text: string, model: ModelConfig) => void);
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
}

export const ChatInputContext = createContext<ChatInputContextValue | null>(
  null,
);

export const useChatInputContext = () => {
  const context = useContext(ChatInputContext);
  if (!context) {
    throw new Error(
      "ChatInput compound components must be used within ChatInput.Root",
    );
  }
  return context;
};
