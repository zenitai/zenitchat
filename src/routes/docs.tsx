import { siteConfig } from "@/config/site.config";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import CopyButton from "@/components/ui/copy-button";

export function Docs() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          React Router inside Next.js with client-side routing
        </p>
      </div>

      <Timeline defaultValue={1}>
        <TimelineItem step={1}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineTitle className="-mt-0.5">Setup</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <pre className="text-sm">
                  <code>git clone {siteConfig.socials.github}</code>
                </pre>
                <CopyButton text={`git clone ${siteConfig.socials.github}`} />
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <pre className="text-sm">
                  <code>cd {siteConfig.name.toLowerCase()}</code>
                </pre>
                <CopyButton text={`cd ${siteConfig.name.toLowerCase()}`} />
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <pre className="text-sm">
                  <code>bun install</code>
                </pre>
                <CopyButton text="bun install" />
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                <pre className="text-sm">
                  <code>bun dev</code>
                </pre>
                <CopyButton text="bun dev" />
              </div>
            </div>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem step={2}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineTitle className="-mt-0.5">Route Redirection</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            All routes redirect to{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              /shell
            </code>{" "}
            via next.config.ts (except{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">api</code>{" "}
            routes)
          </TimelineContent>
        </TimelineItem>

        <TimelineItem step={3}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineTitle className="-mt-0.5">Shell Loading</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            Shell page loads React Router app with{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              ssr: false
            </code>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem step={4}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineTitle className="-mt-0.5">Client Routing</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            React Router handles all navigation client-side
          </TimelineContent>
        </TimelineItem>

        <TimelineItem step={5}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineTitle className="-mt-0.5">Key Files</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <code className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                  next.config.ts
                </code>
                <span className="text-sm text-muted-foreground">
                  Route redirection config
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <code className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                  src/app/shell/page.tsx
                </code>
                <span className="text-sm text-muted-foreground">
                  Loads React Router app
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <code className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                  src/frontend/app.tsx
                </code>
                <span className="text-sm text-muted-foreground">
                  Main React Router app
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <code className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                  src/config/site.config.ts
                </code>
                <span className="text-sm text-muted-foreground">
                  Site configuration
                </span>
              </div>
            </div>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem step={6}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineTitle className="-mt-0.5">Adding Routes</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  1. Create route file in{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    src/routes/
                  </code>
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-2">
                  <pre className="text-sm">
                    <code>{`// src/routes/new-page.tsx
export function NewPage() {
  return <div>New Page Content</div>
}`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  2. Export in{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    src/routes/index.ts
                  </code>
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-2">
                  <pre className="text-sm">
                    <code>{`export { NewPage } from "./new-page"`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  3. Add route in{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    src/frontend/app.tsx
                  </code>
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-2">
                  <pre className="text-sm">
                    <code>{`<Route path="/new-page" element={<NewPage />} />`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
