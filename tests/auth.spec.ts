import type { Page } from "@playwright/test";
import {
  emailsTo,
  expect,
  latestEmail,
  newAccount,
  signUpByApi,
  test,
  verificationLink,
  type Account,
} from "./support/fixtures";

async function fillSignIn(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** The form's error message (Next also renders an empty route announcer alert). */
const formAlert = (page: Page) =>
  page.getByRole("alert").filter({ hasText: /\S/ });

async function signUpThroughForm(page: Page, account: Account) {
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill(account.name);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Create account" }).click();
}

test.describe("sign up", () => {
  test("explains what is missing before sending anything", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Enter your name")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-up$/);
  });

  test("creates an account, verifies the email and lands on the dashboard", async ({
    page,
  }) => {
    const account = newAccount("Jun Santos");
    await signUpThroughForm(page, account);

    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    await expect(page.getByText(account.email)).toBeVisible();

    const email = await latestEmail(account.email);
    expect(email.subject).toBe("Verify your email");
    await page.goto(verificationLink(email));

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /, Jun$/ }),
    ).toBeVisible();
  });

  test("sends a fresh verification link to an account that was never verified", async ({
    page,
  }) => {
    const account = newAccount();
    await signUpByApi(page, account);
    await emailsTo(account.email, 1);

    await signUpThroughForm(page, account);
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();

    const [first, second] = await emailsTo(account.email, 2);
    expect(second.subject).toBe("Verify your email");
    expect(verificationLink(second)).not.toBe(verificationLink(first));
    await page.goto(verificationLink(second));
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("tells a verified user they already have an account", async ({
    page,
    account,
  }) => {
    await page.context().clearCookies();
    const sent = (await emailsTo(account.email, 1)).length;

    // Same email, different password: the form can't tell it apart from a
    // new sign-up, and the existing password must keep working.
    await signUpThroughForm(page, { ...account, password: "another-password" });
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();

    const email = (await emailsTo(account.email, sent + 1)).at(-1)!;
    expect(email.subject).toBe("You already have an account");
    expect(email.html).toContain("Sign in instead.");
    await page.goto(verificationLink(email));
    await expect(page).toHaveURL(/\/sign-in$/);

    await fillSignIn(page, account.email, account.password);
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("sign in", () => {
  test("asks unverified users to check their email first", async ({ page }) => {
    const account = newAccount();
    await signUpByApi(page, account);

    await page.goto("/sign-in");
    await fillSignIn(page, account.email, account.password);

    await expect(formAlert(page)).toContainText(
      "Verify your email before signing in",
    );
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("rejects a wrong password", async ({ page, account }) => {
    await page.context().clearCookies();
    await page.goto("/sign-in");
    await fillSignIn(page, account.email, "not-the-password");

    await expect(formAlert(page)).toContainText(/invalid email or password/i);
  });

  test("signs a verified user in to the dashboard", async ({
    page,
    account,
  }) => {
    await page.context().clearCookies();
    await page.goto("/sign-in");
    await fillSignIn(page, account.email, account.password);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("button", { name: `Account menu for ${account.email}` }),
    ).toBeVisible();
  });
});

test.describe("signed-in users", () => {
  test("skip the sign-in and sign-up pages", async ({ page, account }) => {
    expect(account.email).toBeTruthy();
    for (const path of ["/sign-in", "/sign-up"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/dashboard$/);
    }
  });

  test("see a dashboard link instead of sign-in on the home page", async ({
    page,
    account,
  }) => {
    expect(account.email).toBeTruthy();
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Go to dashboard" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);
  });

  test("can sign out", async ({ page, account }) => {
    await page.goto("/dashboard");
    await page
      .getByRole("button", { name: `Account menu for ${account.email}` })
      .click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
