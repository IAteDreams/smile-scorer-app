import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoryTable } from "./history-table";

describe("HistoryTable", () => {
  it("puts the header, table and pagination in one titled section", () => {
    render(
      <HistoryTable
        history={{
          rows: [
            {
              id: "1",
              fileName: "beach-day.jpg",
              photoUrl: null,
              thumbnailUrl: null,
              uploaded: "Today, 2:14 PM",
              score: 92,
              emotion: "Happy",
              confidence: "98.1%",
            },
          ],
          loading: false,
          reload: vi.fn(),
          refreshPhoto: vi.fn(),
          query: "",
          sort: "newest",
          onQueryChange: vi.fn(),
          onSortChange: vi.fn(),
          pagination: {
            items: [],
            reset: vi.fn(),
            total: 24,
            start: 1,
            end: 6,
            hasPrevious: false,
            hasNext: true,
            onPrevious: vi.fn(),
            onNext: vi.fn(),
          },
        }}
        picker={{ hiddenId: null, show: vi.fn(), onPhotoError: vi.fn() }}
      />,
    );

    const section = screen.getByRole("region", { name: "History" });
    expect(within(section).getByRole("searchbox")).toBeInTheDocument();
    expect(within(section).getByRole("table")).toHaveTextContent(
      "beach-day.jpg",
    );
    expect(within(section).getByText("Showing 1–6 of 24")).toBeInTheDocument();
  });
});
