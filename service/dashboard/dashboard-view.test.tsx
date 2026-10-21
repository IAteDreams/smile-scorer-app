import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { sampleScores } from "@/service/dashboard/sample-scores";

import { DashboardView } from "./dashboard-view";

vi.mock("@/lib/hooks/use-time-zone", () => ({ useTimeZone: () => "UTC" }));

const NOW = Date.parse("2026-10-21T14:14:00Z");
const entries = sampleScores(NOW);

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
      screen.getByText("You've scored 24 photos. Your last smile was a 92."),
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
    expect(screen.getByText("Showing 1–6 of 24")).toBeInTheDocument();
  });

  it("pages through the history", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Showing 7–12 of 24")).toBeInTheDocument();
    expect(fileNames()[0]).toBe("coffee-date.jpg");

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Showing 1–6 of 24")).toBeInTheDocument();
  });

  it("goes back to the first page when searching", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search photos" }), {
      target: { value: "-day" },
    });
    expect(fileNames()).toEqual([
      "beach-day.jpg",
      "rainy-day.jpg",
      "first-day.jpg",
    ]);
    expect(screen.getByText("Showing 1–3 of 3")).toBeInTheDocument();
  });

  it("switches the chart range", () => {
    renderView();
    const bars = () =>
      within(
        screen.getByRole("list", { name: "Scores from oldest to newest" }),
      ).getAllByRole("listitem");
    expect(bars()).toHaveLength(14);

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(bars()).toHaveLength(24);
    expect(screen.getByText("All uploads")).toBeInTheDocument();
  });

  it("shows the stats", () => {
    renderView();
    expect(screen.getByText("Best score").parentElement).toHaveTextContent(
      "96sunset-walk.jpg · Sep 28",
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
        "22 points above your average. Your second-best score so far.",
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
