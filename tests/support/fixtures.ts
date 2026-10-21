import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import { APP_URL, SERVICES_URL } from "./env";

export type Account = {
  name: string;
  email: string;
  password: string;
};

type Email = { to: string[]; subject: string; html: string };

/** A fresh, unique account so tests never share state. */
export function newAccount(name = "Maria Reyes"): Account {
  return {
    name,
    email: `e2e-${randomUUID()}@example.test`,
    password: "correct-horse-battery",
  };
}

/** The newest email the app sent to `to`, waiting briefly for it. */
export async function latestEmail(to: string) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const response = await fetch(
      `${SERVICES_URL}/__e2e/emails?to=${encodeURIComponent(to)}`,
    );
    const emails = (await response.json()) as Email[];
    if (emails.length > 0) return emails.at(-1)!;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`no email was sent to ${to}`);
}

export function verificationLink(email: Email) {
  const href = /href="([^"]+)"/.exec(email.html)?.[1];
  if (!href) throw new Error("verification email has no link");
  return href.replaceAll("&amp;", "&");
}

export async function signUpByApi(page: Page, account: Account) {
  const response = await page.request.post("/api/auth/sign-up/email", {
    data: { ...account, callbackURL: "/dashboard" },
    headers: { origin: APP_URL },
  });
  expect(response.ok()).toBe(true);
}

type Fixtures = {
  /** A verified account that `page` is already signed in as. */
  account: Account;
};

export const test = base.extend<Fixtures>({
  // Each test looks like a different visitor, so per-IP rate limits on
  // sign-in and sign-up never leak between tests.
  page: async ({ page }, provide) => {
    const ip = `10.${[1, 2, 3].map(() => Math.floor(Math.random() * 250) + 1).join(".")}`;
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": ip });
    await provide(page);
  },

  account: async ({ page }, provide) => {
    const account = newAccount();
    await signUpByApi(page, account);
    await page.goto(verificationLink(await latestEmail(account.email)));
    await expect(page).toHaveURL(/\/dashboard$/);
    await provide(account);
  },
});

export { expect };
