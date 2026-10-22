import { EMAILS } from "@/lib/constants/emails";
import { env } from "@/lib/env";
import { mailer } from "@/lib/mailer";

type Email = { to: string; subject: string; html: string };

const link = (url: string, text: string) => `<a href="${url}">${text}</a>`;

async function send(email: Email) {
  await mailer.sendMail({ from: env.EMAIL_FROM, ...email });
}

export async function sendVerificationEmail({
  user,
  url,
}: {
  user: { email: string };
  url: string;
}) {
  if (env.NODE_ENV === "development") {
    console.info(`[auth] Verify ${user.email}: ${url}`);
    return;
  }
  await send({
    to: user.email,
    subject: EMAILS.verify.subject,
    html: link(url, EMAILS.verify.action),
  });
}

/**
 * Tells a verified user that someone signed up with their email. The sign-up
 * form shows "Check your email" either way, so it never reveals who has an
 * account.
 */
export async function sendExistingAccountEmail({
  email,
  signInUrl,
}: {
  email: string;
  signInUrl: string;
}) {
  if (env.NODE_ENV === "development") {
    console.info(`[auth] Existing account ${email}: ${signInUrl}`);
    return;
  }
  const copy = EMAILS.existingAccount;
  await send({
    to: email,
    subject: copy.subject,
    html: `<p>${copy.body}</p><p>${link(signInUrl, copy.action)}</p><p>${copy.footer}</p>`,
  });
}
