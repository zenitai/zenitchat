import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      type="button"
      aria-label="Logout"
      onClick={async () => {
        try {
          await authClient.signOut();
        } catch (err) {
          console.error("Failed to sign out", err);
        }
      }}
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span className="hidden md:inline" aria-hidden="true">
        Logout
      </span>
    </Button>
  );
}
