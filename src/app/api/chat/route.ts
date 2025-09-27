import {
  convertToModelMessages,
  smoothStream,
  streamText,
  UIMessage,
  tool,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
    stopWhen: [stepCountIs(2)],
    tools: {
      multiplier: tool({
        description: "Multiply a number by 2",
        inputSchema: z.object({
          number: z.number().describe("The number to multiply by 2"),
        }),
        execute: async ({ number }: { number: number }) => {
          // Randomly fail half the time
          if (Math.random() < 0.5) {
            throw new Error("Random failure: multiplication failed");
          }

          const result = number * 2;

          return {
            input: number,
            result,
            message: `${number} × 2 = ${result}`,
          };
        },
      }),
    },
    experimental_transform: smoothStream(),
  });

  return result.toUIMessageStreamResponse();
}
