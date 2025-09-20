import {
  convertToModelMessages,
  smoothStream,
  streamText,
  UIMessage,
} from "ai";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-oss-20b",
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
    experimental_transform: smoothStream(),
  });

  return result.toUIMessageStreamResponse();
}
