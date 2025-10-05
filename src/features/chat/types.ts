import type { ConvexFunctions } from "./hooks/use-convex-functions";
import type { StreamingMessageStore } from "./core/streaming-message-store";
import type { MyUIMessage } from "@/features/messages/types";

export interface SendMessageOptions {
  threadId: string;
  content: string;
  model?: string;
  isNewThread: boolean;
  convexFunctions: ConvexFunctions;
  store: StreamingMessageStore<MyUIMessage>;
}

export interface RegenerateMessageOptions {
  threadId: string;
  messageId: string;
  model?: string;
  convexFunctions: ConvexFunctions;
  store: StreamingMessageStore<MyUIMessage>;
}

export interface EditMessageOptions {
  threadId: string;
  messageId: string;
  content: string;
  model?: string;
  convexFunctions: ConvexFunctions;
  store: StreamingMessageStore<MyUIMessage>;
}
