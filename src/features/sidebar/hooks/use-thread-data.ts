import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { usePaginatedQuery } from "convex/react";
import { env } from "@/env";

const LOCAL_STORAGE_KEY = `${env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX}-threads`;

export function useThreadData() {
  const {
    results: threadsFromConvex,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.threads.getUserThreads,
    {},
    { initialNumItems: 100 },
  );

  const threadsFromLocalStorage: typeof threadsFromConvex = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "null",
  );

  useEffect(() => {
    if (threadsFromConvex) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(threadsFromConvex),
      );
    }
  }, [threadsFromConvex]);

  return {
    threads: threadsFromConvex || threadsFromLocalStorage,
    status,
    loadMore,
  };
}
