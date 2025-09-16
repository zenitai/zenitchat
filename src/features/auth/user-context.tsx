import { createContext, use, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type User =
  | {
      userId?: string | null;
      username?: string | null;
      name: string;
      displayUsername?: string | null;
      email: string;
      image?: string | null;
    }
  | null
  | undefined;

const UserContext = createContext<User | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const user = useQuery(api.auth.getCurrentUserMinimal);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = use(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
