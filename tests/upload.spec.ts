import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { SERVICES_URL } from "./support/env";
import { expect, test } from "./support/fixtures";
import { PHOTO_FIXTURE } from "./support/paths";

// USE_MOCK_SCORER: 0.6 × 99.2 + 0.3 × 98.1 + 0.1 × 94.6 = 98, "Beaming".
const MOCK_SCORE = "98";

async function openUpload(page: Page) {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Upload photo" }).click();
  const dialog = page.getByRole("dialog", { name: "Upload a photo" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test("only scores a valid photo once consent is given", async ({
  page,
  account,
}) => {
  expect(account.email).toBeTruthy();
  const dialog = await openUpload(page);
  const score = dialog.getByRole("button", { name: "Score smile" });
  await expect(score).toBeDisabled();

  await dialog.locator('input[type="file"]').setInputFiles({
    name: "party.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("GIF89a"),
  });
  await expect(dialog.getByRole("alert")).toHaveText("Use a JPG or PNG photo");

  await dialog.locator('input[type="file"]').setInputFiles(PHOTO_FIXTURE);
  await expect(dialog.getByText("smile.jpg")).toBeVisible();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await expect(score).toBeDisabled();

  await dialog.getByRole("checkbox").check();
  await expect(score).toBeEnabled();

  await dialog.getByRole("button", { name: "Remove smile.jpg" }).click();
  await expect(score).toBeDisabled();
});

test("scores a photo and shows it in the history", async ({
  page,
  account,
}) => {
  expect(account.email).toBeTruthy();
  const dialog = await openUpload(page);
  await dialog.locator('input[type="file"]').setInputFiles(PHOTO_FIXTURE);
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Score smile" }).click();

  await expect(
    page.getByText(`smile.jpg scored ${MOCK_SCORE}: Beaming`),
  ).toBeVisible();

  const photo = page.getByRole("dialog", { name: "smile.jpg" });
  await expect(photo).toBeVisible();
  await expect(photo).toContainText("Beaming");
  await expect(photo).toContainText(
    "Your first score. Upload more to compare.",
  );
  await page.keyboard.press("Escape");
  await expect(photo).toBeHidden();

  await expect(
    page.getByText(
      `You've scored 1 photo. Your last smile was a ${MOCK_SCORE}.`,
    ),
  ).toBeVisible();
  const row = page
    .getByRole("region", { name: "History" })
    .getByRole("row", { name: /smile\.jpg/ });
  await expect(row).toContainText(MOCK_SCORE);
  await expect(row.locator("img")).toHaveAttribute("src", /\.thumb\.webp/);

  const stored = (await (
    await fetch(`${SERVICES_URL}/__e2e/files`)
  ).json()) as string[];
  expect(stored.some((path) => path.endsWith(".thumb.webp"))).toBe(true);
});

test("refuses to score photos without a session", async ({ playwright }) => {
  const anonymous = await playwright.request.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const response = await anonymous.post("/api/score", {
    multipart: {
      photo: {
        name: "smile.jpg",
        mimeType: "image/jpeg",
        buffer: readFileSync(PHOTO_FIXTURE),
      },
    },
  });
  expect(response.status()).toBe(401);
  await anonymous.dispose();
});
