import type { ReactNode } from "react";
import { useChatInputContext } from "../context";

export interface ChatInputContainerProps {
  children: ReactNode;
}

export const ChatInputContainer = ({ children }: ChatInputContainerProps) => {
  const { chatInputContainerRef } = useChatInputContext();

  return (
    <div className="w-full">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col">
        <div ref={chatInputContainerRef} className="pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

ChatInputContainer.displayName = "ChatInput.Container";
