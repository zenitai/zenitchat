import { Link } from "react-router";
import { Button } from "@/components/ui/button";

interface AuthCardProps {
  unAuthedNewUser: boolean;
  unAuthedReturningUser: boolean;
  markAsVisited: () => void;
}

export function AuthCard({
  unAuthedNewUser,
  unAuthedReturningUser,
  markAsVisited,
}: AuthCardProps) {
  if (!unAuthedNewUser && !unAuthedReturningUser) {
    return null; // Don't show card for authenticated users
  }

  // Defensive guard: if both flags are true, prioritize new user
  // This shouldn't happen in normal flow, but handle it explicitly
  if (unAuthedNewUser && unAuthedReturningUser) {
    console.warn(
      "Both unAuthedNewUser and unAuthedReturningUser are true. Prioritizing new user flow.",
    );
  }

  const isNewUser = unAuthedNewUser; // Explicitly prioritize new user if both are true
  const title = isNewUser ? "Welcome to Zenit" : "Welcome back";
  const description = isNewUser
    ? "Create your account to start chatting with AI and manage your conversation history."
    : "Sign in to continue your conversations and access your saved threads.";
  const buttonText = isNewUser ? "Sign up" : "Log in";
  const buttonUrl = isNewUser ? "/signup" : "/login";

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        {description}
      </p>
      <Button variant="outline" size="sm" asChild className="w-full">
        <Link to={buttonUrl} onClick={markAsVisited}>
          {buttonText}
        </Link>
      </Button>
    </div>
  );
}
