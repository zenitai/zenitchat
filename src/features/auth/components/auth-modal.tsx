import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useUnAuthedNewUser, useUnAuthedReturningUser } from "../store";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const unAuthedNewUser = useUnAuthedNewUser();
  const unAuthedReturningUser = useUnAuthedReturningUser();

  const isSignup = unAuthedNewUser;
  const isLogin = unAuthedReturningUser;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          {isSignup ? "Create your account" : "Login to your account"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isSignup
            ? "Sign up to start chatting with AI and manage your conversation history."
            : "Sign in to continue your conversations and access your saved threads."}
        </DialogDescription>
        {(isSignup || isLogin) && (
          <div className="flex flex-col gap-6 p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-muted-foreground">
                {isSignup
                  ? "Sign up to start chatting with AI and manage your conversation history."
                  : "Sign in to continue your conversations and access your saved threads."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" asChild>
                <Link to={isSignup ? "/signup" : "/login"}>
                  {isSignup ? "Sign up" : "Sign in"}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
