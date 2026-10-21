import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scoreEntry, TEST_NOW } from "@/lib/__fixtures__/score-entry";
import type { ScoreEntry, ScorePage, ScoreSummary } from "@/types/score";

import { DashboardView } from "./dashboard-view";

const { refresh, toast } = vi.hoisted(() => ({
  refresh: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/hooks/use-time-zone", () => ({ useTimeZone: () => "UTC" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("sonner", () => ({ toast }));

const NOW = TEST_NOW;

// Newest first; days 0–5 make a six-day streak, sunset-walk is the best.
const PHOTOS: [string, number, number][] = [
  ["beach-day.jpg", 0, 92],
  ["graduation.png", 1, 81],
  ["birthday-cake.jpg", 2, 90],
  ["office-badge.jpg", 3, 54],
  ["selfie-0931.jpg", 4, 73],
  ["park-picnic.jpg", 5, 85],
  ["coffee-date.jpg", 7, 79],
  ["rainy-day.jpg", 17, 58],
  ["sunset-walk.jpg", 40, 96],
];
const ranked = [...PHOTOS].sort((a, b) => b[2] - a[2]);
const entries: ScoreEntry[] = PHOTOS.map(([fileName, daysAgo, score]) =>
  scoreEntry({
    id: fileName.replace(/\.\w+$/, ""),
    fileName,
    daysAgo,
    score,
    rank: ranked.findIndex(([name]) => name === fileName) + 1,
  }),
);

const chart = (entry: ScoreEntry) => ({
  id: entry.id,
  fileName: entry.fileName,
  uploadedAt: entry.uploadedAt,
  score: entry.score,
  label: entry.label,
});

// What getScoreSummary returns for these photos.
const SUMMARY: ScoreSummary = {
  count: 9,
  average: 79,
  recentAverage: 77,
  previousAverage: 96,
  thisWeek: 6,
  best: chart(entries[8]),
  latest: chart(entries[0]),
  bands: { Beaming: 4, Smiling: 3, "Slight smile": 2, Neutral: 0 },
  recent: [...entries].reverse().map(chart),
  uploadTimes: entries.map((entry) => entry.uploadedAt),
};

const page = (items: ScoreEntry[], index = 0, total = 9): ScorePage => ({
  items,
  total,
  page: index,
  pageSize: 6,
});

const FIRST_PAGE = page(entries.slice(0, 6));

const ok = (data: unknown) => Response.json({ success: true, data });

const fileNames = () =>
  within(screen.getByRole("table"))
    .getAllByRole("rowheader")
    .map((cell) => cell.textContent);

const renderView = (summary = SUMMARY, history = FIRST_PAGE) =>
  render(
    <DashboardView
      name="Maria Reyes"
      now={NOW}
      summary={summary}
      history={history}
    />,
  );

describe("DashboardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), "http://localhost");
        const q = url.searchParams.get("q") ?? "";
        if (url.searchParams.get("page") === "1") {
          return ok(page(entries.slice(6), 1));
        }
        if (q === "-day") {
          return ok(page([entries[0], entries[7]], 0, 2));
        }
        return ok(FIRST_PAGE);
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("greets the user by first name with a summary", () => {
    renderView();
    expect(
      screen.getByRole("heading", { level: 1, name: "Good afternoon, Maria" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You've scored 9 photos. Your last smile was a 92."),
    ).toBeInTheDocument();
  });

  it("shows the first page the server sent", () => {
    renderView();
    expect(fileNames()).toEqual([
      "beach-day.jpg",
      "graduation.png",
      "birthday-cake.jpg",
      "office-badge.jpg",
      "selfie-0931.jpg",
      "park-picnic.jpg",
    ]);
    expect(screen.getByText("Showing 1–6 of 9")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches the next page of the history", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() =>
      expect(screen.getByText("Showing 7–9 of 9")).toBeInTheDocument(),
    );
    expect(fileNames()).toEqual([
      "coffee-date.jpg",
      "rainy-day.jpg",
      "sunset-walk.jpg",
    ]);
  });

  it("searches the history on the server", async () => {
    renderView();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search photos" }), {
      target: { value: "-day" },
    });

    await waitFor(() =>
      expect(fileNames()).toEqual(["beach-day.jpg", "rainy-day.jpg"]),
    );
    expect(screen.getByText("Showing 1–2 of 2")).toBeInTheDocument();
  });

  it("switches the chart range", () => {
    renderView();
    const bars = () =>
      within(
        screen.getByRole("list", { name: "Scores from oldest to newest" }),
      ).getAllByRole("listitem");
    expect(bars()).toHaveLength(9);

    fireEvent.click(screen.getByRole("button", { name: "30 days" }));
    expect(bars()).toHaveLength(8);
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("says when the chart only covers recent uploads", () => {
    renderView({ ...SUMMARY, count: 250 });
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Last 100 uploads")).toBeInTheDocument();
  });

  it("shows the totals from the database", () => {
    renderView();
    expect(screen.getByText("Best score").parentElement).toHaveTextContent(
      "96sunset-walk.jpg · Sep 11",
    );
    expect(screen.getByText("Average score").parentElement).toHaveTextContent(
      "79−19 vs. previous 30 days",
    );
    expect(screen.getByText("Smile streak").parentElement).toHaveTextContent(
      "6 days",
    );
    expect(screen.getByText("All 9 photos")).toBeInTheDocument();
  });

  it("expands a photo and compares it with the whole history", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "View beach-day.jpg" }));

    const dialog = await screen.findByRole("dialog", { name: "beach-day.jpg" });
    await waitFor(() =>
      expect(dialog).toHaveAccessibleDescription(
        "13 points above your average. Your second-best score so far.",
      ),
    );

    fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("guides a new user", () => {
    renderView(
      {
        ...SUMMARY,
        count: 0,
        average: null,
        recentAverage: null,
        previousAverage: null,
        thisWeek: 0,
        best: null,
        latest: null,
        bands: { Beaming: 0, Smiling: 0, "Slight smile": 0, Neutral: 0 },
        recent: [],
        uploadTimes: [],
      },
      page([], 0, 0),
    );
    expect(
      screen.getByText("Upload a photo to get your first smile score."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No photos yet. Upload one to see it here."),
    ).toBeInTheDocument();
  });
});
