import "./polyfills";
import { render } from "@react-email/components";
import React from "react";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { type RunMutationCtx } from "@convex-dev/better-auth";
import PasswordResetEmail from "./emails/reset_password_email";
import VerificationEmail from "./emails/verification_email";
//import { v.EmailId, v.EmailEvent } from "@convex-dev/resend";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
  //onEmailEvent: internal.email.handleEmailEvent,
});

// This callback below may be used for any business logic
{
  /*
export const handleEmailEvent = internalMutation({
  args: {
    id: v.EmailId,
    event: v.EmailEvent,
  },
  handler: async (ctx, args) => {
    console.log("Email event received:", args.event);
  },
});
};
*/
}

export const sendEmailVerification = async (
  ctx: RunMutationCtx,
  {
    to,
    url,
    userName,
  }: {
    to: string;
    url: string;
    userName?: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: "Zenit <hi@mail.zenit.chat>",
    to,
    subject: "Verify your email address",
    html: await render(
      React.createElement(VerificationEmail, {
        userName: userName || "there",
        verificationUrl: url,
      }),
    ),
  });
};

export const sendPasswordResetEmail = async (
  ctx: RunMutationCtx,
  {
    to,
    url,
    userName,
  }: {
    to: string;
    url: string;
    userName?: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: "Zenit <auth@mail.zenit.chat>",
    to,
    subject: "Reset your password",
    html: await render(
      React.createElement(PasswordResetEmail, {
        userName: userName || "there",
        resetUrl: url,
        requestTime: new Date().toLocaleString(),
      }),
    ),
  });
};
