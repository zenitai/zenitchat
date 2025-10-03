# ZenitChat - AI Chat Platform

An AI chat application built with Next.js, React Router, and Convex for real-time data synchronization.

## Core Commands

• Type-check, format, and lint: `bun check`
• Auto-fix style: `bun format`
• Start dev server: `bun dev` (usually dev server already running, no need to constantly run `bun dev`)
• Build for production: `bun build` (run this only when user requests it, same rule applies to `bun start`)
• Start production server: `bun start`

## Project Architecture

### Routing Strategy

- **Next.js App Router** handles API routes and shell page
- **React Router 7** manages all client-side routing
- All routes redirect to `/shell` via `next.config.ts` rewrites
- Shell page loads React Router app with `ssr: false`

### Key Directories

```
src/
├─ app/           → Next.js App Router (API routes + shell)
├─ frontend/      → React Router application (app.tsx)
├─ routes/        → Route components and layouts
├─ features/      → Feature-based modules
├─ components/    → Reusable UI components
├─ lib/          → Utilities and helpers
└─ styles/       → Global CSS and Tailwind
```

### Data Layer

- **Convex** for real-time database and functions
- **Better Auth** for authentication (usign convex better auth component)
- **Zustand** for client state management
- **AI SDK** for streaming chat responses

## Development Patterns & Constraints

### Tech Stack Requirements

- **Next.js 15** with App Router for API routes
- **React Router 7** for client-side routing (bypasses Next.js routing)
- **Tailwind CSS** for styling with utility-first approach
- **Shadcn/UI** components built on Radix UI primitives
- **Lucide React** for icons
- **TypeScript** strict mode with proper type definitions

### Performance Standards

- Every decision evaluated by performance impact
- Minimize blocking operations and perceived latency
- Batch or debounce expensive operations
- Avoid unnecessary re-renders that make UI sluggish
- Use React Compiler for automatic optimizations

### Code Quality Rules

- Write clear, self-documenting code with meaningful names
- Keep functions, components, and modules small and focused
- Use modular, reusable components (especially Shadcn/UI)
- Handle errors gracefully with helpful messages
- Write complete, bug-free, fully functional code
- NO todo comments, placeholders, or missing pieces
- All navigation must use React Router

### Solution Quality Standards

- **Suggest solutions for senior-level engineers** - no junior-level shortcuts or workarounds
- **Make no mistakes** - every solution must be correct and production-ready
- **Simple solutions for complex problems** - elegant, minimal code that solves the problem completely
- **Simple ≠ Easy** - simple means perfect, elegant, and maintainable; easy may be sloppy
- Choose the most straightforward approach that works correctly
- Avoid overengineering but don't cut corners

### Code Styling

- Prettier formatted with 80 character line width
- Match existing project formatting style
- Format imports, exports, objects, arrays properly
- Use TypeScript properly - NO `any` types, proper interfaces

## Git Workflow Essentials

1. Branch from `main` with descriptive names: `feature/<slug>` or `bugfix/<slug>`
2. Run `bun check` locally before committing
3. Force pushes allowed only on feature branches with `git push --force-with-lease`
4. Keep commits atomic with clear messages (`feat:`, `fix:`, `refactor:`)

## Environment Variables

### Server Variables

- `OPENROUTER_API_KEY` - OpenRouter API access
- `AI_GATEWAY_API_KEY` - AI Gateway service key
- `CONVEX_DEPLOYMENT` - Convex deployment URL
- `BETTER_AUTH_SECRET` - Authentication secret
- `CONVEX_BRIDGE_API_KEY` - Convex bridge access
- `RESEND_API_KEY` - Email service key
- `RESEND_WEBHOOK_SECRET` - Email webhook secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Client Variables

- `NEXT_PUBLIC_CONVEX_URL` - Convex client URL
- `NEXT_PUBLIC_CONVEX_SITE_URL` - Convex site URL
- `NEXT_PUBLIC_SITE_URL` - Application site URL
- `NEXT_PUBLIC_LOCALSTORAGE_PREFIX` - LocalStorage key prefix (i.e. app name - zenitchat)

## Feature Architecture

### Authentication

- Better Auth with email/password and Google OAuth
- Auth splash gate for initial loading states

### Chat System

- **Convex messages** for persistent storage and real-time sync
- **Streaming assistant messages** appended during generation using `useSyncExternalStore` from ephemeral in memory store
- **Main chat function**: `makeRequest` handles the core chat flow
- **Effect.ts** manages request processing, fetching, stream processing, and API routes
- Thread-based conversation management with real-time updates

### UI Components

- Shadcn/UI component library
- Custom components in `src/components/ui/`
- Theme support with dark/light mode
- Responsive design with Tailwind CSS

## Package Management

- Use `bun` as package manager
- Install packages with `bun add <package>`
- Install Shadcn components with `shadcn add <component>` (alias already configured in path)
- Never modify package.json directly - use bun commands

## Evidence Required for Every PR

A pull request is reviewable when it includes:

- All tests pass (`bun check`)
- Lint & type check pass (`bun check`)
- Code follows project patterns and conventions
- **Proof artifact**:
  - Bug fix → failing test added first, now passes
  - Feature → new functionality demonstrated
- Clear commit/PR description covering intent
- No drop in code quality or performance

## Common Gotchas

- All routes must go through React Router, not Next.js routing
- API routes stay in `src/app/api/` using Next.js App Router
- Client-side routing bypasses Next.js via shell page
- Use Convex functions for database operations, not direct API calls
- Authentication state managed by Better Auth, not custom solutions
- Performance is critical - avoid unnecessary re-renders and blocking operations
