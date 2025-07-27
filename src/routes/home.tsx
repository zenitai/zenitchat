import {
  Package,
  Shield,
  Settings,
  Rocket,
  Sparkles,
  Zap,
  ArrowRightIcon,
  Settings2,
  GithubIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site.config"
import { Link } from "react-router"

export function Home() {
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
  )
}
