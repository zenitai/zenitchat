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
          name: authUser.name,
          image: authUser.image || undefined,
          username: authUser.username || undefined,
          displayUsername: authUser.displayUsername || undefined,
          emailVerified: authUser.emailVerified,
          twoFactorEnabled: authUser.twoFactorEnabled || undefined,
          isAnonymous: authUser.isAnonymous || undefined,
          phoneNumber: authUser.phoneNumber || undefined,
          phoneNumberVerified: authUser.phoneNumberVerified || undefined,
          createdAt: authUser.createdAt,
          updatedAt: authUser.updatedAt,
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
        if (newUser.userId) {
          await ctx.db.patch(newUser.userId as Id<"users">, {
            email: newUser.email,
            name: newUser.name,
            image: newUser.image || undefined,
            username: newUser.username || undefined,
            displayUsername: newUser.displayUsername || undefined,
            emailVerified: newUser.emailVerified,
            twoFactorEnabled: newUser.twoFactorEnabled || undefined,
            isAnonymous: newUser.isAnonymous || undefined,
            phoneNumber: newUser.phoneNumber || undefined,
            phoneNumberVerified: newUser.phoneNumberVerified || undefined,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
          });
        }
      },
      onDelete: async (ctx, authUser) => {
        if (authUser.userId) {
          await ctx.db.delete(authUser.userId as Id<"users">);
        }
      },
    },
  },
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseURL) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required for BetterAuth links in Convex for BetterAuth",
    );
  }
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are required in Convex for BetterAuth",
    );
  }

  return betterAuth({
    baseURL,
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
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
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
      ...(user ?? {}),
      ...userMetadata,
    };
  },
});

// Optimized query that only returns the fields we actually need
export const getCurrentUserMinimal = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await authComponent.safeGetAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }

    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    if (!user) {
      return null;
    }

    return {
      userId: userMetadata.userId,
      username: user.username,
      name: user.name,
      displayUsername: user.displayUsername,
      email: user.email,
      image: user.image,
    };
  },
});
