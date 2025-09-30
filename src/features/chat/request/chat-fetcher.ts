import { Effect, Stream } from "effect";
import { HttpClient, HttpBody } from "@effect/platform";
import type { ChatFetcher } from "./types";
import { env } from "@/env";
import { processChatStream } from "../utils/parse-json-event-stream";

export const chatFetcher: ChatFetcher = ({ messages, model }) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const response = yield* httpClient
      .pipe(HttpClient.filterStatusOk)
      .post(`${env.NEXT_PUBLIC_SITE_URL}/api/chat`, {
        body: yield* HttpBody.json({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            metadata: message.metadata,
          })),
          model,
        }),
      });

    return processChatStream(
      response.stream.pipe(
        Stream.catchTag("ResponseError", () => Stream.empty),
      ),
    );
  });
