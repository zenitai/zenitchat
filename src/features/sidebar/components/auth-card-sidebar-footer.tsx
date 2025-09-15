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

  const title = unAuthedNewUser ? "Welcome to ZenitChat" : "Welcome back";
  const description = unAuthedNewUser
    ? "Create your account to start chatting with AI and manage your conversation history."
    : "Sign in to continue your conversations and access your saved threads.";
  const buttonText = unAuthedNewUser ? "Sign up" : "Log in";
  const buttonUrl = unAuthedNewUser ? "/signup" : "/login";

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
