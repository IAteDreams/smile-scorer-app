import type { Page } from "@playwright/test";
import { seedPhotos, type SeedPhoto } from "./support/db";
import { expect, test } from "./support/fixtures";

// Newest first; days 0–5 make a six-day streak, sunset-walk is the best.
// Average 79, so beach-day (92) is 13 above it and second-best.
const PHOTOS: SeedPhoto[] = [
  { fileName: "beach-day.jpg", score: 92, daysAgo: 0 },
  { fileName: "graduation.png", score: 81, daysAgo: 1 },
  { fileName: "birthday-cake.jpg", score: 90, daysAgo: 2 },
  { fileName: "office-badge.jpg", score: 54, daysAgo: 3 },
  { fileName: "selfie-0931.jpg", score: 73, daysAgo: 4 },
  { fileName: "park-picnic.jpg", score: 85, daysAgo: 5 },
  { fileName: "coffee-date.jpg", score: 79, daysAgo: 7 },
  { fileName: "rainy-day.jpg", score: 58, daysAgo: 17 },
  { fileName: "sunset-walk.jpg", score: 96, daysAgo: 40 },
];

const history = (page: Page) => page.getByRole("region", { name: "History" });

const fileNames = (page: Page) =>
  history(page).getByRole("rowheader").allTextContents();

const stat = (page: Page, label: string) =>
  page.locator("dl > div").filter({ hasText: label });

test("guides a new user to their first upload", async ({ page, account }) => {
  expect(account.email).toBeTruthy();
  await page.goto("/dashboard");

  await expect(
    page.getByText("Upload a photo to get your first smile score."),
  ).toBeVisible();
  await expect(
    history(page).getByText("No photos yet. Upload one to see it here."),
  ).toBeVisible();
  await expect(stat(page, "Photos scored")).toContainText("0");
  await expect(page.getByText("No photos yet").first()).toBeVisible();
});

test.describe("with a history", () => {
  test.beforeEach(async ({ page, account }) => {
    await seedPhotos(account.email, PHOTOS);
    await page.goto("/dashboard");
  });

  test("summarises every photo from the database", async ({ page }) => {
    await expect(
      page.getByText("You've scored 9 photos. Your last smile was a 92."),
    ).toBeVisible();
    await expect(stat(page, "Average score")).toContainText("79");
    await expect(stat(page, "Best score")).toContainText("96sunset-walk.jpg");
    await expect(stat(page, "Photos scored")).toContainText("9");
    await expect(stat(page, "Smile streak")).toContainText("6 days");
    await expect(page.getByText("All 9 photos")).toBeVisible();
  });

  test("charts recent scores and switches range", async ({ page }) => {
    const bars = page
      .getByRole("list", { name: "Scores from oldest to newest" })
      .getByRole("listitem");
    await expect(bars).toHaveCount(9);

    await page.getByRole("button", { name: "30 days" }).click();
    await expect(bars).toHaveCount(8);
    await expect(page.getByText("Last 30 days")).toBeVisible();
  });

  test("pages through the history from the server", async ({ page }) => {
    await expect(history(page).getByText("Showing 1–6 of 9")).toBeVisible();
    expect(await fileNames(page)).toEqual(
      PHOTOS.slice(0, 6).map((photo) => photo.fileName),
    );

    await history(page).getByRole("button", { name: "Next" }).click();
    await expect(history(page).getByText("Showing 7–9 of 9")).toBeVisible();
    expect(await fileNames(page)).toEqual([
      "coffee-date.jpg",
      "rainy-day.jpg",
      "sunset-walk.jpg",
    ]);
    await expect(
      history(page).getByRole("button", { name: "Next" }),
    ).toBeDisabled();
  });

  test("searches and sorts on the server", async ({ page }) => {
    await history(page)
      .getByRole("searchbox", { name: "Search photos" })
      .fill("-day");
    await expect(history(page).getByText("Showing 1–2 of 2")).toBeVisible();
    expect(await fileNames(page)).toEqual(["beach-day.jpg", "rainy-day.jpg"]);

    await history(page)
      .getByRole("searchbox", { name: "Search photos" })
      .fill("");
    await history(page).getByRole("button", { name: "Newest first" }).click();
    await page.getByRole("menuitemradio", { name: "Highest score" }).click();

    await expect(history(page).getByText("Showing 1–6 of 9")).toBeVisible();
    await expect(history(page).getByRole("rowheader").first()).toHaveText(
      "sunset-walk.jpg",
    );
  });

  test("shows small thumbnails from storage", async ({ page }) => {
    const thumbnail = history(page)
      .getByRole("button", { name: "View beach-day.jpg" })
      .locator("img");
    await expect(thumbnail).toHaveAttribute("src", /\.thumb\.webp/);
    await expect
      .poll(() =>
        thumbnail.evaluate((img: HTMLImageElement) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
  });

  test("expands a photo with its score and closes it again", async ({
    page,
  }) => {
    await history(page)
      .getByRole("button", { name: "View beach-day.jpg" })
      .click();

    const dialog = page.getByRole("dialog", { name: "beach-day.jpg" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Beaming");
    await expect(dialog).toContainText(
      "13 points above your average. Your second-best score so far.",
    );
    await expect(
      dialog.getByRole("img", { name: "Photo beach-day.jpg" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("downloads a photo under its file name", async ({ page }) => {
    await history(page)
      .getByRole("button", { name: "View beach-day.jpg" })
      .click();
    const dialog = page.getByRole("dialog", { name: "beach-day.jpg" });
    await expect(
      dialog.getByRole("button", { name: "Download" }),
    ).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      dialog.getByRole("button", { name: "Download" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("beach-day.jpg");
    await expect(page.getByText("Downloading beach-day.jpg")).toBeVisible();
  });
});
