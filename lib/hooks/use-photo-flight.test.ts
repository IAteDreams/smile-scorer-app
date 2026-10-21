import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePhotoFlight } from "./use-photo-flight";

const { flyPhoto } = vi.hoisted(() => ({
  flyPhoto: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/photo-flight", () => ({ flyPhoto }));

const origin = { left: 10, top: 20, width: 44, height: 44 };

const setup = (hasPhoto = true) => {
  const options = {
    hasPhoto,
    getOrigin: vi.fn(() => origin),
    onFlightStart: vi.fn(),
    onClose: vi.fn(),
  };
  const hook = renderHook(() => usePhotoFlight(options));
  hook.result.current.photoRef.current = document.createElement("div");
  return { ...hook, options };
};

describe("usePhotoFlight", () => {
  beforeEach(() => flyPhoto.mockClear());

  it("waits hidden until the photo has loaded", () => {
    const { result } = setup();
    expect(result.current).toMatchObject({
      phase: "loading",
      photoVisible: false,
      panelVisible: false,
      backdropVisible: false,
      closed: false,
    });
  });

  it("flies in from the thumbnail, then shows the panel", async () => {
    const { result, options } = setup();

    await act(() => result.current.flyIn(null));

    expect(options.onFlightStart).toHaveBeenCalledTimes(1);
    expect(flyPhoto).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      origin,
      "in",
    );
    expect(result.current).toMatchObject({
      phase: "open",
      photoVisible: true,
      panelVisible: true,
      backdropVisible: true,
    });
  });

  it("flies back out, then closes and hides everything", async () => {
    const { result, options } = setup();
    await act(() => result.current.flyIn(null));

    await act(() => result.current.close());

    expect(flyPhoto).toHaveBeenLastCalledWith(
      expect.any(HTMLElement),
      origin,
      "out",
    );
    expect(options.onClose).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({
      phase: "closed",
      closed: true,
      panelVisible: false,
    });
  });

  it("ignores a second close while one is running", async () => {
    const { result, options } = setup();
    await act(async () => {
      void result.current.close();
      await result.current.close();
    });
    expect(options.onClose).toHaveBeenCalledTimes(1);
  });

  it("does not fly in after the user already closed it", async () => {
    const { result, options } = setup();
    await act(() => result.current.close());
    await act(() => result.current.flyIn(null));
    expect(options.onFlightStart).not.toHaveBeenCalled();
  });

  it("shows the panel at once when there is no photo to fly", async () => {
    const { result, options } = setup(false);
    expect(result.current.panelVisible).toBe(true);

    await act(() => result.current.close());
    expect(flyPhoto).not.toHaveBeenCalled();
    expect(options.onClose).toHaveBeenCalled();
  });

  it("resets for the next photo", async () => {
    const { result } = setup();
    await act(() => result.current.close());
    act(() => result.current.reset());
    expect(result.current.phase).toBe("loading");

    await act(() => result.current.flyIn(null));
    expect(result.current.phase).toBe("open");
  });
});
