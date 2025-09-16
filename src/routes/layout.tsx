import { NavLink, Outlet } from "react-router";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import ThemeToggler from "@/components/theme/toggler";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { LogoutButton } from "@/features/auth";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <NavLink to="/" className="text-xl font-bold text-primary">
                {siteConfig.name}
              </NavLink>
              <div className="hidden md:flex space-x-6">
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `text-sm transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/docs"
                  className={({ isActive }) =>
                    `text-sm transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  Docs
                </NavLink>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
              >
                <a
                  href={siteConfig.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              </Button>
              <ThemeToggler />
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>
    </div>
  );
}
