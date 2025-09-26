import {
  StreamingMessageStore,
  createStreamingMessageStore,
} from "./streaming-message-store";

const stores = new Map<string, StreamingMessageStore>();

export function getOrCreateStreamingStore(
  threadId: string,
): StreamingMessageStore {
  let store = stores.get(threadId);
  if (!store) {
    store = createStreamingMessageStore();
    stores.set(threadId, store);
  }
  return store;
}

export function peekStreamingStore(
  threadId: string,
): StreamingMessageStore | undefined {
  return stores.get(threadId);
}

export function clearStreamingStore(threadId: string) {
  stores.delete(threadId);
}
