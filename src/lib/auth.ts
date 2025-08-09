import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { betterAuthComponent } from "../../convex/auth";
import { type GenericCtx } from "../../convex/_generated/server";
import { requireMutationCtx } from "@convex-dev/better-auth/utils";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
} from "../../convex/email";

// Your Next.js app URL - auth requests will be proxied through this
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL environment variable is required (e.g., http://localhost:3000 or https://zenit.chat)",
  );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
}

export const createAuth = (ctx: GenericCtx) =>
  // Configure your Better Auth instance here
  betterAuth({
    // All auth requests will be proxied through your next.js server
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),

    // Email verification configuration
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(requireMutationCtx(ctx), {
          to: user.email,
          url,
          userName: user.name,
        });
      },
      sendOnSignUp: true,
    },

    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail(requireMutationCtx(ctx), {
          to: user.email,
          url,
          userName: user.name,
        });
      },
    },
    socialProviders: {
      google: {
        clientId: googleClientId as string,
        clientSecret: googleClientSecret as string,
      },
    },

    plugins: [
      // The Convex plugin is required
      convex(),
    ],
  });
