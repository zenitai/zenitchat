import { mutation } from "./_generated/server";
import { components } from "./_generated/api";

export const migrateUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users from our database
    const users = await ctx.db.query("users").collect();

    let migratedCount = 0;

    for (const user of users) {
      // Get the auth user data for this user from BetterAuth
      const authUser = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
          model: "user",
          where: [
            {
              field: "userId",
              value: user._id,
            },
          ],
        },
      );

      if (authUser) {
        // Migrate with real data from BetterAuth
        await ctx.db.patch(user._id, {
          email: authUser.email || undefined,
          name: authUser.name || undefined,
          image: authUser.image || undefined,
          username: authUser.username || undefined,
          displayUsername: authUser.displayUsername || undefined,
          emailVerified: authUser.emailVerified,
          twoFactorEnabled: authUser.twoFactorEnabled || undefined,
          isAnonymous: authUser.isAnonymous || undefined,
          phoneNumber: authUser.phoneNumber || undefined,
          phoneNumberVerified: authUser.phoneNumberVerified || undefined,
          createdAt: authUser.createdAt || user._creationTime,
          updatedAt: authUser.updatedAt || user._creationTime,
        });
        migratedCount++;
      } else {
        // Fallback: migrate with existing data if no auth user found
        await ctx.db.patch(user._id, {
          email: user.email || undefined,
          name: user.name || undefined,
          image: user.image || undefined,
          username: user.username || undefined,
          displayUsername: user.displayUsername || undefined,
          emailVerified: user.emailVerified || undefined,
          twoFactorEnabled: user.twoFactorEnabled || undefined,
          isAnonymous: user.isAnonymous || undefined,
          phoneNumber: user.phoneNumber || undefined,
          phoneNumberVerified: user.phoneNumberVerified || undefined,
          createdAt: user.createdAt || user._creationTime,
          updatedAt: user.updatedAt || user._creationTime,
        });
        migratedCount++;
      }
    }

    return {
      totalUsers: users.length,
      migrated: migratedCount,
    };
  },
});
