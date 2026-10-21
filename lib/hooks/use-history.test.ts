import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { sampleScores } from "@/service/dashboard/sample-scores";

import { useHistory } from "./use-history";

const NOW = Date.parse("2026-10-21T14:14:00Z");
const entries = sampleScores(NOW);
const OPTIONS = { now: NOW, timeZone: "UTC" };

const fileNames = (items: { fileName: string }[]) =>
  items.map((item) => item.fileName);

describe("useHistory", () => {
  it("starts with the newest photos on the first page", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    expect(result.current.query).toBe("");
    expect(result.current.sort).toBe("newest");
    expect(result.current.pagination.total).toBe(24);
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
      "first-day.jpg",
    ]);
  });

  it("keeps the sort while searching", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    act(() => result.current.onSortChange("lowest"));
    act(() => result.current.onQueryChange("-day"));
    expect(fileNames(result.current.pagination.items)).toEqual([
      "rainy-day.jpg",
      "first-day.jpg",
      "beach-day.jpg",
    ]);
  });

  it("uses a custom page size", () => {
    const { result } = renderHook(() =>
      useHistory(entries, { ...OPTIONS, pageSize: 10 }),
    );
    expect(result.current.pagination.items).toHaveLength(10);
  });

  it("formats the current page as table rows", () => {
    const { result } = renderHook(() => useHistory(entries, OPTIONS));
    expect(result.current.rows).toHaveLength(6);
    expect(result.current.rows[0]).toMatchObject({
      id: "sample-1",
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
