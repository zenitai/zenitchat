import type { ConvexFunctions } from "./hooks/use-convex-functions";

export interface SendMessageOptions {
  threadId: string;
  content: string;
  model?: string;
  isNewThread: boolean;
  convexFunctions: ConvexFunctions;
}

export interface RegenerateMessageOptions {
  threadId: string;
  messageId: string;
  model?: string;
  convexFunctions: ConvexFunctions;
}

export interface EditMessageOptions {
  threadId: string;
  messageId: string;
  content: string;
  model?: string;
  convexFunctions: ConvexFunctions;
}
