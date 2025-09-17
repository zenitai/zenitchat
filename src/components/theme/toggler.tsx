"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeTogglerProps = {
  className?: string;
};

export default function ThemeToggler({ className }: ThemeTogglerProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const switchTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("light");
        break;
      case "system":
        setTheme(resolvedTheme === "light" ? "dark" : "light");
        break;
      default:
        break;
    }
  };

  const toggleTheme = () => {
    switchTheme();
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className={cn("rounded-full cursor-pointer", className)}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
