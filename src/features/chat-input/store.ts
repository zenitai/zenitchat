import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelConfig } from "@/features/models";
import { DEFAULT_MODEL } from "@/features/models";
import { env } from "@/env";

const INITIAL_INPUT_HEIGHT = 141;

interface ChatInputStore {
  // Selected model state
  selectedModel: ModelConfig | null;

  // Input text
  inputText: string;

  // Input height
  inputHeight: number;

  // Actions
  actions: {
    // Model related actions
    setSelectedModel: (model: ModelConfig) => void;

    // Input text related actions
    setInputText: (text: string) => void;
    clearInputText: () => void;

    // Input height related actions
    setInputHeight: (height: number) => void;
  };
}

const useChatInputStore = create<ChatInputStore>()(
  persist(
    (set) => ({
      // Initial state
      selectedModel: DEFAULT_MODEL,
      inputText: "",
      inputHeight: INITIAL_INPUT_HEIGHT,

      // Actions
      actions: {
        setSelectedModel: (model: ModelConfig) => set({ selectedModel: model }),
        setInputText: (text: string) => set({ inputText: text }),
        clearInputText: () => set({ inputText: "" }),
        setInputHeight: (height: number) => set({ inputHeight: height }),
      },
    }),
    {
      name: `${env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX}-chat-input-store`,
      // Only persist the selected model
      partialize: (state) => ({
        selectedModel: state.selectedModel,
      }),
    },
  ),
);

// Hook for reading selected model
export const useSelectedModel = () => {
  const selectedModel = useChatInputStore((state) => state.selectedModel);
  return selectedModel || DEFAULT_MODEL;
};

// Hook for reading input text
export const useInputText = () => useChatInputStore((state) => state.inputText);

// Getter function for accessing store outside React components
export const getSelectedModel = (): ModelConfig => {
  const state = useChatInputStore.getState();
  return state.selectedModel || DEFAULT_MODEL;
};

// Hook for reading input height
export const useInputHeight = () =>
  useChatInputStore((state) => state.inputHeight);

// Hook for all actions (convenience hook)
export const useChatInputActions = () =>
  useChatInputStore((state) => state.actions);
