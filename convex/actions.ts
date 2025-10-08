"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateText, convertToModelMessages, validateUIMessages } from "ai";
import { api } from "./_generated/api";
import type { MessageParts } from "./schema/messages";

/**
 * Generates a thread title based on the first user message.
 * Uses gemini-2.0-flash-lite for fast, cheap title generation.
 * Runs on Convex server to keep API key secure.
 */
export const generateTitle = action({
  args: {
    message: v.any(),
  },
  handler: async (ctx, args) => {
    // Validate the UI message first
    const validatedMessages = await validateUIMessages({
      messages: [args.message],
    });
    const message = validatedMessages[0];

    // Generate title with AI
    const result = await generateText({
      model: "google/gemini-2.0-flash-lite",
      system: `You will generate a short title based on the first message a user begins a conversation with.
- Ensure it is not more than 80 characters long
- The title should be a summary of the user's message
- Do not use quotes or colons
- DO NOT use any markdown
- DO NOT use any emojis
- DO NOT use any special characters
- DO NOT use any numbers
- DO NOT use any punctuation`,
      messages: convertToModelMessages([message]),
    });

    return result.text.trim();
  },
});

/**
 * Regenerates a thread title based on all messages in the thread.
 * Uses gemini-2.0-flash-lite for fast, cheap title generation.
 * Runs on Convex server to keep API key secure.
 */
export const regenerateTitle = action({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all messages for the thread
    const messages = await ctx.runQuery(api.messages.getThreadMessages, {
      threadId: args.threadId,
    });

    if (!messages || messages.length === 0) {
      throw new Error("No messages found for thread");
    }

    // Format messages for title generation
    const formatMessageContent = (parts: MessageParts) => {
      return parts
        .map((part) => {
          if (part.type === "text" && "text" in part) {
            return part.text;
          }
          if (part.type === "reasoning" && "text" in part) {
            return `**Reasoning:**\n${part.text}`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n\n");
    };

    const conversationText = messages
      .map((message) => {
        const content = formatMessageContent(message.parts);
        const roleLabel = message.role === "user" ? "USER" : "ASSISTANT";
        return `${roleLabel}:\n${content}`;
      })
      .join("\n\n==========\n\n");

    // Generate title with AI based on all messages
    const result = await generateText({
      model: "google/gemini-2.0-flash-lite",
      prompt: `You will generate a short title based on the entire conversation in this thread.
- Ensure it is not more than 80 characters long
- The title should be a summary of the main topic or theme of the conversation
- Do not use quotes or colons
- DO NOT use any markdown
- DO NOT use any emojis
- DO NOT use any special characters
- DO NOT use any numbers
- DO NOT use any punctuation

Conversation:
${conversationText}`,
    });

    const title: string = result.text.trim();

    return title;
  },
});
