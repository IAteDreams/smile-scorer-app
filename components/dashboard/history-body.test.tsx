import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { HistoryBody } from "./history-body";

const setup = (overrides: Partial<ComponentProps<typeof HistoryBody>> = {}) => {
  const props: ComponentProps<typeof HistoryBody> = {
    rows: [
      {
        id: "1",
        fileName: "beach-day.jpg",
        photoUrl: "/group_of_friends.webp",
        uploaded: "Today, 2:14 PM",
        score: 92,
        emotion: "Happy",
        confidence: "98.1%",
      },
    ],
    query: "",
    picker: { hiddenId: null, show: vi.fn() },
    ...overrides,
  };
  render(<HistoryBody {...props} />);
  return props;
};

describe("HistoryBody", () => {
  it("labels the columns", () => {
    setup();
    expect(
      screen.getAllByRole("columnheader").map((cell) => cell.textContent),
    ).toEqual([
      "Photo",
      "File",
      "Uploaded",
      "Smile score",
      "Emotion",
      "Confidence",
    ]);
  });

  it("shows each photo's details", () => {
    setup();
    const row = screen.getByRole("row", { name: /beach-day\.jpg/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["", "Today, 2:14 PM", "92", "Happy", "98.1%"]);
    expect(
      within(row).getByText("92").nextElementSibling!.firstElementChild,
    ).toHaveStyle({ width: "92%" });
  });

  it("opens a photo from its thumbnail or row", () => {
    const { show: onSelect } = setup().picker;
    fireEvent.click(screen.getByRole("button", { name: "View beach-day.jpg" }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("1");

    vi.mocked(onSelect).mockClear();
    fireEvent.click(screen.getByText("Today, 2:14 PM"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("leaves an empty slot while the photo is expanded", () => {
    setup({ picker: { hiddenId: "1", show: vi.fn() } });
    const button = screen.getByRole("button", { name: "View beach-day.jpg" });
    expect(button.querySelector("img")).toHaveClass("invisible");
    expect(button.firstElementChild).toHaveAttribute("data-thumbnail", "1");
  });

  it("explains when a search has no matches", () => {
    setup({ rows: [], query: " zebra " });
    expect(screen.getByText("No photos match “zebra”.")).toBeInTheDocument();
  });

  it("explains an empty history", () => {
    setup({ rows: [] });
    expect(
      screen.getByText("No photos yet. Upload one to see it here."),
    ).toBeInTheDocument();
  });
});
