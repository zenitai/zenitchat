import type { UIMessage } from "ai";
import * as v from "valibot";

// Message metadata schema with Valibot
export const messageMetadataSchema = v.object({
  model: v.optional(v.string()),
  providerOptions: v.optional(v.unknown()),
  tokens: v.optional(
    v.object({
      input: v.optional(v.number()),
      reasoning: v.optional(v.number()),
      output: v.optional(v.number()),
      total: v.optional(v.number()),
    }),
  ),
  errors: v.optional(
    v.array(
      v.object({
        message: v.string(),
      }),
    ),
  ),
  // Additional metadata can be added here
});

// Message metadata type inferred from Valibot schema
export type MessageMetadata = v.InferOutput<typeof messageMetadataSchema>;

// Custom UIMessage type with typed metadata
export type MyUIMessage = UIMessage<MessageMetadata>;

// Base message type used across all message components
export interface MessageProps {
  message: MyUIMessage;
  className?: string;
}
