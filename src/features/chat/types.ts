import type { ConvexFunctions } from "./hooks/use-convex-functions";

export interface SendMessageOptions {
  threadId: string;
  content: string;
  model?: string;
  isNewThread: boolean;
  convexFunctions: ConvexFunctions;
}
