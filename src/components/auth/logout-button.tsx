import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button variant="ghost" onClick={() => authClient.signOut()}>
      <LogOut className="size-4" />
      <div className="hidden md:block">Logout</div>
    </Button>
  );
}
