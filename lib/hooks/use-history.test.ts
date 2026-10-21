import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { scoreEntry, TEST_NOW } from "@/lib/__fixtures__/score-entry";

import { useHistory } from "./use-history";

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
const OPTIONS = { now: TEST_NOW, timeZone: "UTC" };

const fileNames = (items: { fileName: string }[]) =>
  items.map((item) => item.fileName);

describe("useHistory", () => {
  it("starts with the newest photos on the first page", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    expect(result.current.query).toBe("");
    expect(result.current.sort).toBe("newest");
    expect(result.current.pagination.total).toBe(9);
    expect(fileNames(result.current.pagination.items)).toEqual([
      "beach-day.jpg",
      "graduation.png",
      "birthday-cake.jpg",
      "office-badge.jpg",
      "selfie-0931.jpg",
      "park-picnic.jpg",
    ]);
  });

  it("sorts and goes back to the first page", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    act(() => result.current.pagination.onNext());
    expect(result.current.pagination.start).toBe(7);

    act(() => result.current.onSortChange("highest"));
    expect(result.current.sort).toBe("highest");
    expect(result.current.pagination.start).toBe(1);
    expect(result.current.pagination.items[0].fileName).toBe("sunset-walk.jpg");
  });

  it("searches and goes back to the first page", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    act(() => result.current.pagination.onNext());

    act(() => result.current.onQueryChange("-day"));
    expect(result.current.query).toBe("-day");
    expect(result.current.pagination.start).toBe(1);
    expect(fileNames(result.current.pagination.items)).toEqual([
      "beach-day.jpg",
      "rainy-day.jpg",
    ]);
  });

  it("keeps the sort while searching", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    act(() => result.current.onSortChange("lowest"));
    act(() => result.current.onQueryChange("-day"));
    expect(fileNames(result.current.pagination.items)).toEqual([
      "rainy-day.jpg",
      "beach-day.jpg",
    ]);
  });

  it("uses a custom page size", () => {
    const { result } = renderHook(() =>
      useHistory(entries, { ...OPTIONS, pageSize: 4 }),
    );
    expect(result.current.pagination.items).toHaveLength(4);
  });

  it("formats the current page as table rows", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    expect(result.current.rows).toHaveLength(6);
    expect(result.current.rows[0]).toMatchObject({
      id: "beach-day",
      fileName: "beach-day.jpg",
      uploaded: expect.stringMatching(/^Today, /),
      score: 92,
      emotion: "Happy",
      confidence: "98.1%",
    });

    act(() => result.current.pagination.onNext());
    expect(result.current.rows[0].fileName).toBe("coffee-date.jpg");
  });
});
