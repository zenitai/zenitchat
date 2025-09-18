import { convertToModelMessages, streamText, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-oss-120b",
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
    providerOptions: {
      openai: {
        reasoningEffort: "high",
        reasoningSummary: "detailed",
      },
      gateway: {
        only: ["cerebras"],
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
