import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ERRORS } from "@/lib/error";

import { usePhotoDownload } from "./use-photo-download";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast }));

const respond = (body: unknown) =>
  vi.mocked(fetch).mockResolvedValueOnce(Response.json(body));

describe("usePhotoDownload", () => {
  let clicked: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    clicked = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this.href);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("asks for a download link, saves it and confirms", async () => {
    respond({ success: true, data: { url: "https://signed/download" } });
    const { result } = renderHook(() => usePhotoDownload());

    await act(() => result.current.download("photo-1", "beach-day.jpg"));

    expect(fetch).toHaveBeenCalledWith("/api/upload/photo-1?download=1");
    expect(clicked).toEqual(["https://signed/download"]);
    expect(toast.success).toHaveBeenCalledWith("Downloading beach-day.jpg");
    expect(document.querySelector("a")).toBeNull();
  });

  it("tracks which photo is downloading", async () => {
    let finish!: (value: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { result } = renderHook(() => usePhotoDownload());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.download("photo-1", "beach-day.jpg");
    });
    expect(result.current.pendingId).toBe("photo-1");

    await act(async () => {
      finish(Response.json({ success: true, data: { url: "https://x" } }));
      await pending;
    });
    expect(result.current.pendingId).toBeNull();
  });

  it.each([
    [
      "the API refuses",
      () => respond({ success: false, error: { message: "Not found" } }),
    ],
    [
      "the network fails",
      () => vi.mocked(fetch).mockRejectedValueOnce(new Error("offline")),
    ],
  ])("shows an error toast when %s", async (_, fail) => {
    fail();
    const { result } = renderHook(() => usePhotoDownload());

    await act(() => result.current.download("photo-1", "beach-day.jpg"));

    expect(toast.error).toHaveBeenCalledWith(ERRORS.photo.downloadFailed);
    expect(toast.success).not.toHaveBeenCalled();
    expect(clicked).toEqual([]);
  });
});
