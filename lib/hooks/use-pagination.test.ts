import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePagination } from "./use-pagination";

const numbers = (count: number) => Array.from({ length: count }, (_, i) => i);

describe("usePagination", () => {
  it("starts on the first page", () => {
    const { result } = renderHook(() => usePagination(numbers(14), 6));
    expect(result.current).toMatchObject({
      items: [0, 1, 2, 3, 4, 5],
      total: 14,
      start: 1,
      end: 6,
      hasPrevious: false,
      hasNext: true,
    });
  });

  it("moves between pages and stops at the last one", () => {
    const { result } = renderHook(() => usePagination(numbers(14), 6));

    act(() => result.current.onNext());
    act(() => result.current.onNext());
    expect(result.current).toMatchObject({
      items: [12, 13],
      start: 13,
      end: 14,
      hasPrevious: true,
      hasNext: false,
    });

    act(() => result.current.onPrevious());
    expect(result.current.start).toBe(7);
  });

  it("goes back to the first page on reset", () => {
    const { result } = renderHook(() => usePagination(numbers(14), 6));
    act(() => result.current.onNext());
    act(() => result.current.reset());
    expect(result.current.start).toBe(1);
  });

  it("stays on a page that still exists when the list shrinks", () => {
    const { result, rerender } = renderHook(
      ({ count }) => usePagination(numbers(count), 6),
      { initialProps: { count: 14 } },
    );
    act(() => result.current.onNext());
    act(() => result.current.onNext());

    rerender({ count: 4 });
    expect(result.current).toMatchObject({
      items: [0, 1, 2, 3],
      start: 1,
      end: 4,
      hasNext: false,
    });
  });

  it("handles an empty list", () => {
    const { result } = renderHook(() => usePagination([], 6));
    expect(result.current).toMatchObject({
      items: [],
      total: 0,
      start: 0,
      end: 0,
      hasPrevious: false,
      hasNext: false,
    });
  });
});
