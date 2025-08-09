import "./polyfills";
import VerificationEmail from "./emails/verification_email";
import { render } from "@react-email/components";
import React from "react";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { type RunMutationCtx } from "@convex-dev/better-auth";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

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
