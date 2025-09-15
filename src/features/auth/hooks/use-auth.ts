import { useConvexAuth } from "convex/react";
import { useState, useEffect } from "react";
import { env } from "@/env";

type UserStatus = "new" | "returning" | "authenticated";

const STORAGE_KEY = `${env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX}_visited`;

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [userStatus, setUserStatus] = useState<UserStatus>("new");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisitedBefore = localStorage.getItem(STORAGE_KEY);

    if (isAuthenticated) {
      setUserStatus("authenticated");
    } else if (hasVisitedBefore) {
      setUserStatus("returning");
    } else {
      setUserStatus("new");
      // Mark as visited for future visits
      localStorage.setItem(STORAGE_KEY, "true");
    }

    setIsInitialized(true);
  }, [isAuthenticated]);

  const isNewUser = userStatus === "new";
  const isReturningUser = userStatus === "returning";

  return {
    // Auth state from Convex
    isAuthenticated,
    isLoading: isLoading || !isInitialized,

    // User status
    userStatus,
    // UI helpers
    unAuthedNewUser: isNewUser && !isAuthenticated,
    unAuthedReturningUser: isReturningUser && !isAuthenticated,
  };
}
