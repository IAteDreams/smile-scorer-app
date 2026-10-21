import { expect, test } from "./support/fixtures";

test.describe("home page", () => {
  test("introduces the product and points visitors to sign up", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Smilescore/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "How big is your smile, really?",
      }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Score my smile" }).click();
    await expect(page).toHaveURL(/\/sign-up$/);
  });

  test("explains how it works in three steps", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See how it works" }).click();

    await expect(page).toHaveURL(/#how-it-works$/);
    const steps = page.getByRole("region", { name: "Three steps to a score" });
    await expect(steps).toBeInViewport();
    await expect(steps.getByRole("listitem")).toHaveCount(3);
    await expect(steps).toContainText("JPG or PNG up to 4 MB");
  });

  test("offers sign in and sign up to visitors", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });
});

test.describe("legal pages", () => {
  test("links from the footer to the privacy policy and terms", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Privacy Policy" })
      .click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page).toHaveTitle("Privacy Policy · Smilescore");

    await page
      .getByRole("navigation", { name: "Legal pages" })
      .getByRole("link", { name: /Terms/ })
      .click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page).toHaveTitle("Terms of Service · Smilescore");
  });

  test("jumps to a section from the table of contents", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the table of contents is hidden on small screens");
    await page.goto("/privacy");

    await page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link", { name: "Retention and deletion" })
      .click();
    await expect(page).toHaveURL(/#retention-and-deletion$/);
    await expect(page.locator("#retention-and-deletion")).toBeInViewport();
  });
});

test("keeps signed-out visitors out of the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});
