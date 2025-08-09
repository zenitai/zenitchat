import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./auth";
import { createAuth } from "../src/lib/auth";
import { httpAction } from "./_generated/server";
import { resend } from "./email";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, createAuth);

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;
