import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { sampleScores } from "@/service/dashboard/sample-scores";

import { usePhotoViewer } from "./use-photo-viewer";

const NOW = Date.parse("2026-10-21T14:14:00Z");
const entries = sampleScores(NOW);
const OPTIONS = { now: NOW, timeZone: "UTC" };

describe("usePhotoViewer", () => {
  it("starts with nothing open", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    expect(result.current.selectedId).toBeNull();
    expect(result.current.hiddenId).toBeNull();
    expect(result.current.dialog.open).toBe(false);
  });

  it("opens a photo and hides its thumbnail only once it flies", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));

    act(() => result.current.show("sample-1"));
    expect(result.current.selectedId).toBe("sample-1");
    expect(result.current.dialog.open).toBe(true);
    expect(result.current.hiddenId).toBeNull();

    act(() => result.current.dialog.onFlightStart());
    expect(result.current.hiddenId).toBe("sample-1");
  });

  it("shows the thumbnail again as soon as the dialog closes", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    act(() => result.current.show("sample-1"));
    act(() => result.current.dialog.onFlightStart());

    act(() => result.current.dialog.onOpenChange(false));
    expect(result.current.dialog.open).toBe(false);
    expect(result.current.hiddenId).toBeNull();
    expect(result.current.selectedId).toBe("sample-1");

    act(() => result.current.dialog.onClosed());
    expect(result.current.selectedId).toBeNull();
  });

  it("builds the dialog's photo details for the selected entry", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    expect(result.current.dialog.photo).toBeNull();

    act(() => result.current.show("sample-1"));
    expect(result.current.dialog.photo).toMatchObject({
      id: "sample-1",
      fileName: "beach-day.jpg",
      score: 92,
      label: "Beaming",
      faceCount: 4,
      faceConfidence: "99.9%",
    });
  });
});
