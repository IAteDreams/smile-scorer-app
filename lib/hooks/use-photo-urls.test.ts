import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scoreEntry } from "@/lib/__fixtures__/score-entry";

import { usePhotoUrls } from "./use-photo-urls";

const entries = [
  scoreEntry({ id: "photo-1" }),
  scoreEntry({ id: "photo-2", daysAgo: 1 }),
];

const respond = (body: unknown) =>
  vi.mocked(fetch).mockResolvedValueOnce(Response.json(body));

describe("usePhotoUrls", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("passes entries through until a photo needs refreshing", () => {
    const { result } = renderHook(() => usePhotoUrls(entries));
    expect(result.current.entries).toEqual(entries);
  });

  it("swaps in a fresh signed URL for that photo only", async () => {
    respond({ success: true, data: { url: "https://signed/new" } });
    const { result } = renderHook(() => usePhotoUrls(entries));

    let ok = false;
    await act(async () => {
      ok = await result.current.refresh("photo-1");
    });

    expect(ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith("/api/upload/photo-1");
    expect(result.current.entries[0].photoUrl).toBe("https://signed/new");
    expect(result.current.entries[1].photoUrl).toBe(entries[1].photoUrl);
  });

  it("shows the placeholder when the photo is gone", async () => {
    respond({ success: false, error: { message: "Not found" } });
    const { result } = renderHook(() => usePhotoUrls(entries));

    let ok = true;
    await act(async () => {
      ok = await result.current.refresh("photo-1");
    });
    expect(ok).toBe(false);
    expect(result.current.entries[0].photoUrl).toBeNull();
  });

  it("treats a network failure like a missing photo", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => usePhotoUrls(entries));
    await act(async () => {
      await result.current.refresh("photo-1");
    });
    expect(result.current.entries[0].photoUrl).toBeNull();
  });

  it("does not retry the same photo within a minute", async () => {
    respond({ success: true, data: { url: "https://signed/new" } });
    respond({ success: true, data: { url: "https://signed/newer" } });
    const { result } = renderHook(() => usePhotoUrls(entries));

    await act(async () => {
      await result.current.refresh("photo-1");
    });
    let ok = true;
    await act(async () => {
      ok = await result.current.refresh("photo-1");
    });
    expect(ok).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 61_000);
    await act(async () => {
      await result.current.refresh("photo-1");
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.entries[0].photoUrl).toBe("https://signed/newer");
  });
});
