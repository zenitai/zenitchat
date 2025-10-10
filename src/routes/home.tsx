import {
  Package,
  Shield,
  Rocket,
  Sparkles,
  Zap,
  ArrowRightIcon,
  Settings2,
  GithubIcon,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { Link } from "react-router";
import { FileList } from "@/features/files/components/file-list";
import type { FileItem as FileItemType } from "@/features/files/types";

const DEMO_FILES: FileItemType[] = [
  {
    id: "1",
    filename: "W3_Regression Analysis_Stata_Notes (1).pdf",
    mediaType: "application/pdf",
    url: "/Users/apalon1/Downloads/W3_Regression Analysis_Stata_Notes (1).pdf",
    status: "uploading",
  },
  {
    id: "2",
    filename: "W3_Regression Analysis_Stata_Notes (1).pdf",
    mediaType: "application/pdf",
    url: "/Users/apalon1/Downloads/W3_Regression Analysis_Stata_Notes (1).pdf",
    status: "complete",
  },
  {
    id: "6",
    filename: "W3_Regression Analysis_Stata_Notes (1).pdf",
    mediaType: "application/pdf",
    url: "/Users/apalon1/Downloads/W3_Regression Analysis_Stata_Notes (1).pdf",
    status: "marked-for-deletion",
  },
  {
    id: "3",
    filename: "IMG_9537.PNG",
    mediaType: "image/png",
    url: "https://pub-8db9e91f9f0f42d1874bfe5e0c01140d.r2.dev/0f97375f-86c5-47b6-376c-7cac8ac1cd03",
    status: "uploading",
  },
  {
    id: "4",
    filename: "IMG_9537.PNG",
    mediaType: "image/png",
    url: "https://pub-8db9e91f9f0f42d1874bfe5e0c01140d.r2.dev/0f97375f-86c5-47b6-376c-7cac8ac1cd03",
    status: "complete",
  },
  {
    id: "5",
    filename: "IMG_9537.PNG",
    mediaType: "image/png",
    url: "https://pub-8db9e91f9f0f42d1874bfe5e0c01140d.r2.dev/0f97375f-86c5-47b6-376c-7cac8ac1cd03",
    status: "marked-for-deletion",
  },
];

export function Home() {
  const colorVars = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "border",
    "input",
    "ring",
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
    "sidebar",
    "sidebar-foreground",
    "sidebar-primary",
    "sidebar-primary-foreground",
    "sidebar-accent",
    "sidebar-accent-foreground",
    "sidebar-border",
    "sidebar-ring",
  ] as const;

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Next.js + React Router
          </h2>
          <p>
            A minimal template that combines Next.js with React Router for
            client-side routing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group" asChild>
              <Link to="/docs">
                Get Started
                <ArrowRightIcon
                  className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
                  size={16}
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={siteConfig.socials.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon size={16} />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Color Palette</h3>
            <p className="text-muted-foreground text-sm">
              Showing all theme variables as swatches
            </p>
          </div>
          <div
            className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            role="list"
          >
            {colorVars.map((name) => (
              <div
                key={name}
                className="rounded-lg border overflow-hidden"
                role="listitem"
                aria-label={`--${name}`}
              >
                <div
                  className="h-16 w-full border-b"
                  style={{ backgroundColor: `var(--${name})` }}
                />
                <div className="p-2 text-xs flex items-center justify-between">
                  <span className="font-mono">--{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FileItem Component Showcase */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-semibold">FileItem Component</h3>
            <p className="text-muted-foreground text-sm">
              Showing all states: uploading and uploaded for both file and image
              types
            </p>
          </div>
          <div className="flex justify-center">
            <FileList
              files={DEMO_FILES}
              onRemove={(fileId) => console.log("Remove", fileId)}
              onClick={(file) => console.log("Click", file.id)}
            />
          </div>
        </div>

        {/* Button Variants Showcase */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Button Variants</h3>
            <p className="text-muted-foreground mb-8">
              All available button variants and sizes
            </p>
          </div>

          {/* Variants */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-4">Variants</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-lg font-medium mb-4">Sizes</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Heart className="size-4" />
                </Button>
              </div>
            </div>

            {/* Variants with Icons */}
            <div>
              <h4 className="text-lg font-medium mb-4">With Icons</h4>
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Heart className="size-4" />
                  Default
                </Button>
                <Button variant="secondary">
                  <Star className="size-4" />
                  Secondary
                </Button>
                <Button variant="outline">
                  <Zap className="size-4" />
                  Outline
                </Button>
                <Button variant="ghost">
                  <Sparkles className="size-4" />
                  Ghost
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="text-lg font-medium mb-4">States</h4>
              <div className="flex flex-wrap gap-4">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button aria-invalid>Invalid</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">Lightning Fast</h3>
            </div>
            <p className="text-sm">
              Instant page navigation with client-side routing. No more loading
              screens or page refreshes.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="size-4" />
              <h3 className="text-sm font-medium">Next.js Ecosystem</h3>
            </div>
            <p className="text-sm">
              This setup keeps Next.js{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                /api
              </code>{" "}
              routes for backend functionality and ease of use.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="size-4" />

              <h3 className="text-sm font-medium">Type Safe</h3>
            </div>
            <p className="text-sm">
              Built with TypeScript from the ground up. Enjoy full type safety
              across your entire application.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4" />

              <h3 className="text-sm font-medium">Highly Customizable</h3>
            </div>
            <p className="text-sm">
              Easy to customize and extend. Add your own routes, components, and
              styling while maintaining the clean architecture.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Rocket className="size-4" />

              <h3 className="text-sm font-medium">Zero Config</h3>
            </div>
            <p className="text-sm">
              Get started immediately with zero configuration. Everything is set
              up and ready to go - just add your content and deploy.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />

              <h3 className="text-sm font-medium">Built for AI</h3>
            </div>
            <p className="text-sm">
              Comes with predefined cursor rules that cut the bullshit from AI
              responses and keep them focused and useful.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
