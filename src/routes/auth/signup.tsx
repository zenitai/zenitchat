import { GalleryVerticalEnd } from "lucide-react";
import { Link } from "react-router";

import { SignupForm } from "@/features/auth";
import { siteConfig } from "@/config/site.config";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";

export function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative w-full overflow-hidden rounded-md border bg-background hidden lg:flex lg:flex-col lg:items-center lg:justify-center m-5">
        <div className="absolute inset-0 h-full w-full [mask-image:radial-gradient(400px_circle_at_center,white,transparent)] -skew-y-12">
          <InteractiveGridPattern className="h-full w-full" />
        </div>
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/"
            className="flex items-center gap-2 font-medium text-foreground"
          >
            <div className="bg-foreground text-background flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {siteConfig.name}
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
