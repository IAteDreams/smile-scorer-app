import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HistoryFilters } from "@/types/history";

import { HistoryHeader } from "./history-header";

const setup = (overrides: Partial<HistoryFilters> = {}) => {
  const filters: HistoryFilters = {
    query: "",
    onQueryChange: vi.fn(),
    sort: "newest",
    onSortChange: vi.fn(),
    ...overrides,
  };
  render(<HistoryHeader titleId="history-title" filters={filters} />);
  return filters;
};

describe("HistoryHeader", () => {
  it("titles the section with the given id", () => {
    setup();
    expect(screen.getByRole("heading", { name: "History" })).toHaveAttribute(
      "id",
      "history-title",
    );
  });

  it("searches as the user types", () => {
    const { onQueryChange } = setup();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search photos" }), {
      target: { value: "beach" },
    });
    expect(onQueryChange).toHaveBeenCalledWith("beach");
  });

  it("shows the current search", () => {
    setup({ query: "party" });
    expect(screen.getByRole("searchbox")).toHaveValue("party");
  });

  it("shows the current sort", () => {
    setup({ sort: "highest" });
    expect(
      screen.getByRole("button", { name: "Highest score" }),
    ).toBeInTheDocument();
  });
});
