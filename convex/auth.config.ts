const domainUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
if (!domainUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_SITE_URL environment variable is required (e.g., https://your-project-name.convex.site)",
  );
}

export default {
  providers: [
    {
      // Your Convex site URL is provided in a system
      // environment variable
      domain: domainUrl,

      // Application ID has to be "convex"
      applicationID: "convex",
    },
  ],
};
