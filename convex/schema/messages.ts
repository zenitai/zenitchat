import { Infer, v } from "convex/values";

// Message parts validator - reusable validator for message parts
export const messageParts = v.array(
  v.union(
    // Text part
    v.object({
      type: v.literal("text"),
      text: v.string(),
      state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
      providerMetadata: v.optional(v.any()),
    }),
    // Reasoning part
    v.object({
      type: v.literal("reasoning"),
      text: v.string(),
      state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
      providerMetadata: v.optional(v.any()),
    }),
    // Tool part
    v.object({
      type: v.string(), // Will be "tool-{name}" format
      toolCallId: v.string(),
      state: v.union(
        v.literal("input-streaming"),
        v.literal("input-available"),
        v.literal("output-available"),
        v.literal("output-error"),
      ),
      input: v.any(),
      output: v.optional(v.any()),
      errorText: v.optional(v.string()),
      providerExecuted: v.optional(v.boolean()),
      providerMetadata: v.optional(v.any()),
      callProviderMetadata: v.optional(v.any()),
    }),
    // SourceUrl part
    v.object({
      type: v.literal("source-url"),
      sourceId: v.string(),
      url: v.string(),
      title: v.optional(v.string()),
      providerMetadata: v.optional(v.any()),
    }),
    // SourceDocument part
    v.object({
      type: v.literal("source-document"),
      sourceId: v.string(),
      mediaType: v.string(),
      title: v.string(),
      filename: v.optional(v.string()),
      providerMetadata: v.optional(v.any()),
    }),
    // File part
    v.object({
      type: v.literal("file"),
      mediaType: v.string(),
      filename: v.optional(v.string()),
      url: v.string(),
    }),
    // Data part
    v.object({
      type: v.string(), // Will be "data-{name}" format
      id: v.optional(v.string()),
      data: v.any(),
    }),
    // StepStart part
    v.object({
      type: v.literal("step-start"),
    }),
  ),
);

// Error types validator - reusable validator for error types KEEP IN SYNC WITH MakeRequestError + convex_error type
export const errorTypes = v.union(
  v.literal("network"),
  v.literal("transport"),
  v.literal("encode"),
  v.literal("invalid_url"),
  v.literal("http_status"),
  v.literal("response_decode"),
  v.literal("empty_response"),
  v.literal("json_error"),
  v.literal("schema_error"),
  v.literal("stream_processing"),
  v.literal("api_error"),
  v.literal("abort"),
  v.literal("convex_error"),
  v.literal("unknown"),
);

export const messageErrors = v.array(
  v.object({
    type: errorTypes,
    reason: v.string(),
    message: v.string(),
    originalError: v.optional(v.any()),
    timestamp: v.number(),
  }),
);

export const messageMetadata = v.object({
  model: v.optional(v.string()),
  providerOptions: v.optional(v.any()),
  tokens: v.optional(
    v.object({
      input: v.optional(v.number()),
      reasoning: v.optional(v.number()),
      output: v.optional(v.number()),
      total: v.optional(v.number()),
    }),
  ),
  errors: v.optional(messageErrors),
  // Additional metadata can be added here
});

export type MessageMetadata = Infer<typeof messageMetadata>;
export type MessageErrors = Infer<typeof messageErrors>;
export type MessageParts = Infer<typeof messageParts>;
