import type { UIMessage, UIMessagePart } from "ai";
import type {
  InferUIMessageData,
  InferUIMessageTools,
  StreamingUIMessageState,
} from "./types";

export function createStreamingUIMessageState<UI_MESSAGE extends UIMessage>({
  lastMessage,
  messageId,
}: {
  lastMessage: UI_MESSAGE | undefined;
  messageId: string;
}): StreamingUIMessageState<UI_MESSAGE> {
  return {
    message:
      lastMessage?.role === "assistant"
        ? lastMessage
        : ({
            id: messageId,
            metadata: undefined,
            role: "assistant",
            parts: [] as UIMessagePart<
              InferUIMessageData<UI_MESSAGE>,
              InferUIMessageTools<UI_MESSAGE>
            >[],
          } as UI_MESSAGE),
    activeTextParts: {},
    activeReasoningParts: {},
    partialToolCalls: {},
  };
}
