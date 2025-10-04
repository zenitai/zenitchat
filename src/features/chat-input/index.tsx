import { PaperclipIcon, GlobeIcon } from "lucide-react";
import { ChatInputRoot } from "./chat-input-root";
import { ChatInputEditRoot } from "./chat-input-edit-root";
import { ChatInputContainer } from "./components/chat-input-container";
import { ChatInputForm } from "./components/chat-input-form";
import { ChatInputTextarea } from "./components/chat-input-textarea";
import { ModelSelector } from "./model-selector/model-selector";
import {
  ChatInputToolbar,
  ChatInputTools,
} from "./components/chat-input-toolbar";
import { ChatInputButton } from "./components/chat-input-button";
import { ChatInputSubmit } from "./components/chat-input-submit";
import { ScrollToBottomButton } from "./components/scroll-to-bottom-button";
// Export compound component with Radix-style API
export const ChatInput = Object.assign(ChatInputRoot, {
  Root: ChatInputRoot,
  Container: ChatInputContainer,
  Form: ChatInputForm,
  Textarea: ChatInputTextarea,
  Toolbar: ChatInputToolbar,
  Tools: ChatInputTools,
  Button: ChatInputButton,
  Submit: ChatInputSubmit,
  ModelSelector: ModelSelector,
  ScrollToBottom: ScrollToBottomButton,
});

// Export edit chat input with isolated Root
export const ChatInputEdit = Object.assign(ChatInputEditRoot, {
  Root: ChatInputEditRoot,
  // All other components are shared/reused from ChatInput
  Container: ChatInputContainer,
  Form: ChatInputForm,
  Textarea: ChatInputTextarea,
  Toolbar: ChatInputToolbar,
  Tools: ChatInputTools,
  Button: ChatInputButton,
  Submit: ChatInputSubmit,
  ModelSelector: ModelSelector,
});

// Default composition - pre-assembled with Root
export interface ChatInputDefaultProps {
  onSubmit: (text: string) => void;
  threadId?: string;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
}

export const ChatInputDefault = ({
  onSubmit,
  threadId,
  showScrollToBottom,
  onScrollToBottom,
}: ChatInputDefaultProps) => {
  return (
    <ChatInput.Root
      onSubmit={onSubmit}
      threadId={threadId}
      showScrollToBottom={showScrollToBottom}
      onScrollToBottom={onScrollToBottom}
    >
      <ChatInput.ScrollToBottom />
      <ChatInput.Container>
        <ChatInput.Form>
          <ChatInput.Textarea />
          <ChatInput.Toolbar>
            <ChatInput.Tools>
              <ChatInput.ModelSelector />
              <ChatInput.Button variant="outline" aria-label="Attach file">
                <PaperclipIcon className="size-4" />
              </ChatInput.Button>
              <ChatInput.Button variant="outline" aria-label="Search web">
                <GlobeIcon className="size-4" />
              </ChatInput.Button>
            </ChatInput.Tools>
            <ChatInput.Tools>
              <ChatInput.Submit />
            </ChatInput.Tools>
          </ChatInput.Toolbar>
        </ChatInput.Form>
      </ChatInput.Container>
    </ChatInput.Root>
  );
};
