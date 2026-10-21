import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FLIGHT_IN_MS,
  FLIGHT_OUT_MS,
  flightKeyframes,
  flyPhoto,
} from "./photo-flight";

const thumbnail = { left: 100, top: 500, width: 44, height: 44 };
const photo = { left: 200, top: 100, width: 400, height: 600 };

describe("flightKeyframes", () => {
  it("starts as the square thumbnail crop and ends as the full photo", () => {
    const [from, to] = flightKeyframes(thumbnail, photo);
    expect(from).toEqual({
      transformOrigin: "0 0",
      transform: "translate(-100px, 391.2px) scale(0.11)",
      clipPath: "inset(80px 0px 120px 0px round 72.72727272727273px)",
    });
    expect(to).toEqual({
      transformOrigin: "0 0",
      transform: "translate(0px, 0px) scale(1)",
      clipPath: "inset(0px 0px 0px 0px round 8px)",
    });
  });

  it("crops the sides of a landscape photo", () => {
    const [from] = flightKeyframes(thumbnail, {
      left: 0,
      top: 0,
      width: 600,
      height: 400,
    });
    expect(from.clipPath).toMatch(/^inset\(0px 100px 0px 100px /);
  });
});

describe("flyPhoto", () => {
  afterEach(() => vi.unstubAllGlobals());

  const element = () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => photo as DOMRect;
    el.getAnimations = () => [];
    el.animate = vi.fn(() => ({ finished: Promise.resolve() }) as never);
    return el;
  };

  const motion = (reduce: boolean) =>
    vi.stubGlobal("matchMedia", () => ({ matches: reduce }));

  it("flies in from the thumbnail", async () => {
    motion(false);
    const el = element();
    await flyPhoto(el, thumbnail, "in");
    const [frames, options] = vi.mocked(el.animate).mock.calls[0];
    expect(frames).toEqual(flightKeyframes(thumbnail, photo));
    expect(options).toMatchObject({ duration: FLIGHT_IN_MS, fill: "none" });
  });

  it("flies back faster and stays on the thumbnail until it closes", async () => {
    motion(false);
    const el = element();
    await flyPhoto(el, thumbnail, "out");
    const [frames, options] = vi.mocked(el.animate).mock.calls[0];
    expect(frames).toEqual(flightKeyframes(thumbnail, photo).reverse());
    expect(options).toMatchObject({
      duration: FLIGHT_OUT_MS,
      fill: "forwards",
    });
  });

  it("jumps straight there for reduced motion", async () => {
    motion(true);
    const el = element();
    await flyPhoto(el, thumbnail, "in");
    expect(vi.mocked(el.animate).mock.calls[0][1]).toMatchObject({
      duration: 0,
    });
  });

  it("does nothing where animations are unsupported", async () => {
    await expect(
      flyPhoto(document.createElement("div"), thumbnail, "in"),
    ).resolves.toBeUndefined();
  });
});
