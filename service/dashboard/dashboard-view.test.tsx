import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { scoreEntry, TEST_NOW } from "@/lib/__fixtures__/score-entry";

import { DashboardView } from "./dashboard-view";

vi.mock("@/lib/hooks/use-time-zone", () => ({ useTimeZone: () => "UTC" }));

const NOW = TEST_NOW;
const photo = (fileName: string, daysAgo: number, score: number) =>
  scoreEntry({ id: fileName.replace(/\.\w+$/, ""), fileName, daysAgo, score });

// Newest first; days 0–5 make a six-day streak, sunset-walk is the best.
const entries = [
  photo("beach-day.jpg", 0, 92),
  photo("graduation.png", 1, 81),
  photo("birthday-cake.jpg", 2, 90),
  photo("office-badge.jpg", 3, 54),
  photo("selfie-0931.jpg", 4, 73),
  photo("park-picnic.jpg", 5, 85),
  photo("coffee-date.jpg", 7, 79),
  photo("rainy-day.jpg", 17, 58),
  photo("sunset-walk.jpg", 40, 96),
];

const fileNames = () =>
  within(screen.getByRole("table"))
    .getAllByRole("rowheader")
    .map((cell) => cell.textContent);

const renderView = (list = entries) =>
  render(<DashboardView name="Maria Reyes" now={NOW} entries={list} />);

describe("DashboardView", () => {
  it("greets the user by first name with a summary", () => {
    renderView();
    expect(
      screen.getByRole("heading", { level: 1, name: "Good afternoon, Maria" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You've scored 9 photos. Your last smile was a 92."),
    ).toBeInTheDocument();
  });

  it("shows the newest six photos first", () => {
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
  });

  it("pages through the history", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Showing 7–9 of 9")).toBeInTheDocument();
    expect(fileNames()).toEqual([
      "coffee-date.jpg",
      "rainy-day.jpg",
      "sunset-walk.jpg",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Showing 1–6 of 9")).toBeInTheDocument();
  });

  it("goes back to the first page when searching", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search photos" }), {
      target: { value: "-day" },
    });
    expect(fileNames()).toEqual(["beach-day.jpg", "rainy-day.jpg"]);
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

  it("shows the stats", () => {
    renderView();
    expect(screen.getByText("Best score").parentElement).toHaveTextContent(
      "96sunset-walk.jpg · Sep 11",
    );
    expect(screen.getByText("Smile streak").parentElement).toHaveTextContent(
      "6 days",
    );
  });

  it("expands a photo from the history and closes it again", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "View beach-day.jpg" }));

    const dialog = await screen.findByRole("dialog", { name: "beach-day.jpg" });
    await waitFor(() =>
      expect(dialog).toHaveAccessibleDescription(
        "13 points above your average. Your second-best score so far.",
      ),
    );
    expect(within(dialog).getByText("Beaming")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("guides a new user", () => {
    renderView([]);
    expect(
      screen.getByText("Upload a photo to get your first smile score."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No photos yet. Upload one to see it here."),
    ).toBeInTheDocument();
  });
});
