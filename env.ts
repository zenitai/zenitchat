import { createEnv } from "@t3-oss/env-nextjs";
import * as v from "valibot";

export const env = createEnv({
  server: {
    OPENROUTER_API_KEY: v.pipe(v.string(), v.nonEmpty()),
  },
  client: {
    //NEXT_PUBLIC_PUBLISHABLE_KEY: v.pipe(v.string(), v.nonEmpty()),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    //NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  emptyStringAsUndefined: true,
});
