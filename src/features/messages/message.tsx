import { memo } from "react";
import { UserMessage } from "./components/user-message";
import { AssistantMessage } from "./components/assistant-message";
import type { MessageProps } from "./types";

export const Message = memo(
  ({ message, threadId, className }: MessageProps) => {
    const isUser = message.role === "user";

    if (isUser) {
      return (
        <UserMessage
          message={message}
          threadId={threadId}
          className={className}
        />
      );
    }

    return <AssistantMessage message={message} className={className} />;
  },
);

Message.displayName = "Message";
