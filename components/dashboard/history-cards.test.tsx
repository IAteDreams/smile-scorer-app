import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { HistoryCards } from "./history-cards";

const setup = (
  overrides: Partial<ComponentProps<typeof HistoryCards>> = {},
) => {
  const props: ComponentProps<typeof HistoryCards> = {
    rows: [
      {
        id: "1",
        fileName: "beach-day.jpg",
        photoUrl: "/group_of_friends.webp",
        thumbnailUrl: "/group_of_friends.thumb.webp",
        uploaded: "Today, 2:14 PM",
        score: 92,
        emotion: "Happy",
        confidence: "98.1%",
      },
      {
        id: "2",
        fileName: "graduation.png",
        photoUrl: null,
        thumbnailUrl: null,
        uploaded: "Yesterday, 9:02 AM",
        score: 81,
        emotion: "Calm",
        confidence: "91.4%",
      },
    ],
    picker: { hiddenId: null, show: vi.fn(), onPhotoError: vi.fn() },
    ...overrides,
  };
  render(<HistoryCards {...props} />);
  return props;
};

const card = (name: string) =>
  screen.getByRole("button", { name: `View ${name}` });

describe("HistoryCards", () => {
  it("lists a card per photo", () => {
    setup();
    const list = screen.getByRole("list", { name: "Photos" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows each photo's details and describes the card with them", () => {
    setup();
    const button = card("beach-day.jpg");
    for (const text of ["beach-day.jpg", "92", "Today, 2:14 PM", "98.1%"]) {
      expect(within(button).getByText(text)).toBeInTheDocument();
    }
    expect(button).toHaveAccessibleDescription(
      expect.stringContaining("Today, 2:14 PM"),
    );
    expect(
      within(button)
        .getByText("92")
        .closest("[id]")!
        .querySelector('[data-slot="score-bar-fill"]'),
    ).toHaveStyle({ width: "92%" });
  });

  it("opens a photo when its card is tapped", () => {
    const { picker } = setup();
    fireEvent.click(card("graduation.png"));
    expect(picker.show).toHaveBeenCalledExactlyOnceWith("2");
  });

  it("leaves an empty slot while the photo is expanded", () => {
    setup({ picker: { hiddenId: "1", show: vi.fn(), onPhotoError: vi.fn() } });
    expect(card("beach-day.jpg").querySelector("img")).toHaveClass("invisible");
    expect(
      card("beach-day.jpg").querySelector('[data-thumbnail="1"]'),
    ).toBeInTheDocument();
  });

  it("asks for a fresh URL when a thumbnail fails to load", () => {
    const { picker } = setup();
    fireEvent.error(card("beach-day.jpg").querySelector("img")!);
    expect(picker.onPhotoError).toHaveBeenCalledWith("1");
  });
});
