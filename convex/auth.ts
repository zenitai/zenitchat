import {
  createClient,
  type AuthFunctions,
  type GenericCtx,
} from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { requireMutationCtx } from "@convex-dev/better-auth/utils";
import { components, internal } from "./_generated/api";
import { query } from "./_generated/server";
import type { Id, DataModel } from "./_generated/dataModel";
import { sendEmailVerification, sendPasswordResetEmail } from "./email";

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        // Any `onCreateUser` logic should be moved here
        const userId = await ctx.db.insert("users", {
          email: authUser.email,
        });
        // Instead of returning the user id, we set it to the component
        // user table manually. This is no longer required behavior, but
        // is necessary when migrating from previous versions to avoid
        // a required database migration.
        // This helper method exists solely to facilitate this migration.
        await authComponent.setUserId(ctx, authUser._id, userId);
      },
      onUpdate: async (ctx, oldUser, newUser) => {
        // Any `onUpdateUser` logic should be moved here
      },
      onDelete: async (ctx, authUser) => {
        await ctx.db.delete(authUser.userId as Id<"users">);
      },
    },
  },
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.NEXT_PUBLIC_SITE_URL,
    database: authComponent.adapter(ctx),
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
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [convex()],
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await authComponent.safeGetAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }
    // Get user data from your application's database
    // (skip this if you have no fields in your users table schema)
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    return {
      ...user,
      ...userMetadata,
    };
  },
});
