import {
  StreamingMessageStore,
  createStreamingMessageStore,
} from "./streaming-message-store";
import type { MyUIMessage } from "@/features/messages/types";

const stores = new Map<string, StreamingMessageStore<MyUIMessage>>();

export function getOrCreateStreamingStore(
  threadId: string,
): StreamingMessageStore<MyUIMessage> {
  let store = stores.get(threadId);
  if (!store) {
    store = createStreamingMessageStore<MyUIMessage>();
    stores.set(threadId, store);
  }
  return store;
}

export function peekStreamingStore(
  threadId: string,
): StreamingMessageStore<MyUIMessage> | undefined {
  return stores.get(threadId);
}

export function resetStreamingStore(threadId: string) {
  const store = stores.get(threadId);
  if (store) {
    store.message = null;
    store.fiber = null;
    store.status = "ready";
  }
}
