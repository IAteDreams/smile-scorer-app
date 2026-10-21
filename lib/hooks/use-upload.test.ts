import { act, renderHook } from "@testing-library/react";
import type { DragEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ERRORS } from "@/lib/error";

import { useUpload } from "./use-upload";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast }));

const jpeg = (name = "beach-day.jpg", bytes = 2048) =>
  new File([new Uint8Array(bytes)], name, { type: "image/jpeg" });

const RESULT = { id: "photo-1", score: 92, label: "Beaming" };

const setup = () => {
  const onScored = vi.fn();
  const hook = renderHook(() => useUpload({ onScored }));
  return { ...hook, onScored };
};

const ready = (result: ReturnType<typeof setup>["result"]) => {
  act(() => result.current.show());
  act(() => result.current.onPhotoChange(jpeg()));
  act(() => result.current.onConsentChange(true));
};

describe("useUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("starts closed with nothing chosen", () => {
    const { result } = setup();
    expect(result.current).toMatchObject({
      open: false,
      photo: null,
      consent: false,
      canSubmit: false,
      error: null,
    });
  });

  it("shows a preview of the chosen photo", () => {
    const { result } = setup();
    act(() => result.current.onPhotoChange(jpeg()));
    expect(result.current.photo).toEqual({
      name: "beach-day.jpg",
      size: "2 KB",
      previewUrl: "blob:preview",
    });
  });

  it.each([
    [
      "a GIF",
      new File(["x"], "fun.gif", { type: "image/gif" }),
      ERRORS.validation.photoType,
    ],
    [
      "a photo over 4 MB",
      jpeg("huge.jpg", 4 * 1024 * 1024 + 1),
      ERRORS.validation.photoTooLarge,
    ],
  ])("rejects %s before uploading", (_, file, message) => {
    const { result } = setup();
    act(() => result.current.onPhotoChange(file));
    expect(result.current.error).toBe(message);
    expect(result.current.photo).toBeNull();
  });

  it("needs a photo and consent before it can score", () => {
    const { result } = setup();
    act(() => result.current.onPhotoChange(jpeg()));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.onConsentChange(true));
    expect(result.current.canSubmit).toBe(true);
  });

  it("takes a dropped photo", () => {
    const { result } = setup();
    const event = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [jpeg("dropped.png")] },
    } as unknown as DragEvent<HTMLElement>;

    act(() => result.current.onDragOver(event));
    expect(result.current.dragging).toBe(true);
    act(() => result.current.onDrop(event));

    expect(result.current.dragging).toBe(false);
    expect(result.current.photo?.name).toBe("dropped.png");
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("uploads, confirms, closes and hands back the result", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ success: true, data: RESULT }),
    );
    const { result, onScored } = setup();
    ready(result);

    await act(async () => result.current.onSubmit());

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/score");
    expect(init?.method).toBe("POST");
    expect((init?.body as FormData).get("photo")).toBeInstanceOf(File);
    expect(toast.success).toHaveBeenCalledWith(
      "beach-day.jpg scored 92: Beaming",
    );
    expect(onScored).toHaveBeenCalledWith(RESULT);
    expect(result.current).toMatchObject({ open: false, photo: null });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("keeps the dialog open with the API's message when scoring fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({
        success: false,
        error: { message: ERRORS.score.noFace },
      }),
    );
    const { result, onScored } = setup();
    ready(result);

    await act(async () => result.current.onSubmit());

    expect(result.current.error).toBe(ERRORS.score.noFace);
    expect(result.current.open).toBe(true);
    expect(result.current.photo).not.toBeNull();
    expect(onScored).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
  });

  it("explains a network failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const { result } = setup();
    ready(result);

    await act(async () => result.current.onSubmit());
    expect(result.current.error).toBe(ERRORS.score.uploadFailed);
  });

  it("clears everything when closed", () => {
    const { result } = setup();
    ready(result);
    act(() => result.current.onOpenChange(false));
    expect(result.current).toMatchObject({
      open: false,
      photo: null,
      consent: false,
    });
  });
});
