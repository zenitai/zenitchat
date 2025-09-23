import { useEffect, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions, useUserStatus } from "./store";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUserMinimal);
  const { setAuthState, setUser, setUserStatus, setInitialized } =
    useAuthActions();
  const userStatus = useUserStatus();

  // Sync all auth state with store
  useEffect(() => {
    // Data loading: Convex auth + user query
    const isDataLoading = isLoading || user === undefined;

    // Sync auth state with data loading
    setAuthState(isAuthenticated, isDataLoading);

    // Only set user when we have a definitive answer (null or user object)
    if (user !== undefined) {
      setUser(user);
    }

    // Initialize user status when data loading is complete
    if (!isDataLoading) {
      if (isAuthenticated) {
        if (userStatus !== "authenticated") {
          setUserStatus("authenticated");
        }
      } else {
        // Check if user has visited before by looking at persisted state
        if (userStatus === "new") {
          // do nothing, stays "new"
        } else if (userStatus !== "returning") {
          setUserStatus("returning");
        }
      }
      setInitialized(true);
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    userStatus,
    setAuthState,
    setUser,
    setUserStatus,
    setInitialized,
  ]);

  return <>{children}</>;
}
