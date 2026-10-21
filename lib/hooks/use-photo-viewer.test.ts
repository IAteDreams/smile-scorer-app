import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { scoreEntry, TEST_NOW } from "@/lib/__fixtures__/score-entry";

import { usePhotoViewer } from "./use-photo-viewer";

const { downloader } = vi.hoisted(() => ({
  downloader: { pendingId: null as string | null, download: vi.fn() },
}));

vi.mock("@/lib/hooks/use-photo-download", () => ({
  usePhotoDownload: () => downloader,
}));

const entries = [
  scoreEntry({
    id: "photo-1",
    fileName: "beach-day.jpg",
    score: 92,
    faceCount: 4,
  }),
  scoreEntry({ id: "photo-2", daysAgo: 1, score: 81 }),
];
const OPTIONS = {
  now: TEST_NOW,
  timeZone: "UTC",
  totals: { average: 80, count: 2 },
};

describe("usePhotoViewer", () => {
  it("starts with nothing open", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    expect(result.current.selectedId).toBeNull();
    expect(result.current.hiddenId).toBeNull();
    expect(result.current.dialog.open).toBe(false);
  });

  it("opens a photo and hides its thumbnail only once it flies", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));

    act(() => result.current.show("photo-1"));
    expect(result.current.selectedId).toBe("photo-1");
    expect(result.current.dialog.open).toBe(true);
    expect(result.current.hiddenId).toBeNull();

    act(() => result.current.dialog.onFlightStart());
    expect(result.current.hiddenId).toBe("photo-1");
  });

  it("shows the thumbnail again as soon as the dialog closes", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    act(() => result.current.show("photo-1"));
    act(() => result.current.dialog.onFlightStart());

    act(() => result.current.dialog.onOpenChange(false));
    expect(result.current.dialog.open).toBe(false);
    expect(result.current.hiddenId).toBeNull();
    expect(result.current.selectedId).toBe("photo-1");

    act(() => result.current.dialog.onClosed());
    expect(result.current.selectedId).toBeNull();
  });

  it("builds the dialog's photo details for the selected entry", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    expect(result.current.dialog.photo).toBeNull();

    act(() => result.current.show("photo-1"));
    expect(result.current.dialog.photo).toMatchObject({
      id: "photo-1",
      fileName: "beach-day.jpg",
      score: 92,
      label: "Beaming",
      faceCount: 4,
      faceConfidence: "99.9%",
    });
  });

  it("refreshes the open photo's URL through the dialog", async () => {
    const onPhotoError = vi.fn(async () => true);
    const { result } = renderHook(() =>
      usePhotoViewer(entries, { ...OPTIONS, onPhotoError }),
    );

    expect(await result.current.dialog.onPhotoError()).toBe(false);
    expect(onPhotoError).not.toHaveBeenCalled();

    act(() => result.current.show("photo-1"));
    expect(await result.current.dialog.onPhotoError()).toBe(true);
    expect(onPhotoError).toHaveBeenCalledWith("photo-1");
    expect(result.current.onPhotoError).toBe(onPhotoError);
  });

  it("downloads the open photo under its file name", () => {
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    result.current.dialog.onDownload();
    expect(downloader.download).not.toHaveBeenCalled();

    act(() => result.current.show("photo-1"));
    result.current.dialog.onDownload();
    expect(downloader.download).toHaveBeenCalledWith(
      "photo-1",
      "beach-day.jpg",
    );
  });

  it("marks the dialog as downloading only for the open photo", () => {
    downloader.pendingId = "photo-1";
    const { result } = renderHook(() => usePhotoViewer(entries, OPTIONS));
    expect(result.current.dialog.downloading).toBe(false);

    act(() => result.current.show("photo-1"));
    expect(result.current.dialog.downloading).toBe(true);

    act(() => result.current.show("photo-2"));
    expect(result.current.dialog.downloading).toBe(false);
    downloader.pendingId = null;
  });
});
