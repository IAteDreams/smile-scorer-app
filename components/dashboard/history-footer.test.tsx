import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PaginationControls } from "@/types/pagination";

import { HistoryFooter } from "./history-footer";

const setup = (overrides: Partial<PaginationControls> = {}) => {
  const pagination: PaginationControls = {
    total: 24,
    start: 7,
    end: 12,
    hasPrevious: true,
    hasNext: true,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    ...overrides,
  };
  render(<HistoryFooter pagination={pagination} />);
  return pagination;
};

describe("HistoryFooter", () => {
  it("says which results are showing", () => {
    setup();
    expect(screen.getByText("Showing 7–12 of 24")).toBeInTheDocument();
  });

  it("goes to the previous and next page", () => {
    const { onPrevious, onNext } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("disables buttons at the ends", () => {
    setup({ hasPrevious: false, hasNext: false });
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("says when there are no results", () => {
    setup({ total: 0 });
    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});
