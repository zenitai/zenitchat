import { createEnv } from "@t3-oss/env-nextjs";
import * as v from "valibot";

export const env = createEnv({
  server: {
    OPENROUTER_API_KEY: v.pipe(v.string(), v.nonEmpty()),
    AI_GATEWAY_API_KEY: v.pipe(v.string(), v.nonEmpty()),
    CONVEX_DEPLOYMENT: v.pipe(v.string(), v.nonEmpty()),
    BETTER_AUTH_SECRET: v.pipe(v.string(), v.nonEmpty()),
    CONVEX_BRIDGE_API_KEY: v.pipe(v.string(), v.nonEmpty()),
    RESEND_API_KEY: v.pipe(v.string(), v.nonEmpty()),
    RESEND_WEBHOOK_SECRET: v.pipe(v.string(), v.nonEmpty()),
    GOOGLE_CLIENT_ID: v.pipe(v.string(), v.nonEmpty()),
    GOOGLE_CLIENT_SECRET: v.pipe(v.string(), v.nonEmpty()),
  },
  client: {
    //NEXT_PUBLIC_PUBLISHABLE_KEY: v.pipe(v.string(), v.nonEmpty()),
    NEXT_PUBLIC_CONVEX_URL: v.pipe(v.string(), v.nonEmpty()),
    NEXT_PUBLIC_CONVEX_SITE_URL: v.pipe(v.string(), v.nonEmpty()),
    NEXT_PUBLIC_SITE_URL: v.pipe(v.string(), v.nonEmpty()),
    NEXT_PUBLIC_LOCALSTORAGE_PREFIX: v.pipe(
      v.string(),
      v.nonEmpty(),
      v.regex(/^[A-Za-z0-9_-]+$/),
    ),
    // R2 Public URL - needed for generating public URLs
    NEXT_PUBLIC_R2_PUBLIC_URL: v.pipe(v.string(), v.nonEmpty()),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    //NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_LOCALSTORAGE_PREFIX:
      process.env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  },
  emptyStringAsUndefined: true,
});
