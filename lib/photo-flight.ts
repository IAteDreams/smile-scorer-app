import type { Rect } from "@/types/photo";

export const FLIGHT_IN_MS = 350;
export const FLIGHT_OUT_MS = 250;
export const FLIGHT_EASING = "cubic-bezier(0.2, 0, 0, 1)";

const THUMBNAIL_FOCUS_Y = 0.5;
const RADIUS = 8;

export function flightKeyframes(from: Rect, to: Rect): Keyframe[] {
  const scale = Math.max(from.width / to.width, from.height / to.height);
  const visibleWidth = from.width / scale;
  const visibleHeight = from.height / scale;

  const insetX = (to.width - visibleWidth) / 2;
  const insetTop = (to.height - visibleHeight) * THUMBNAIL_FOCUS_Y;
  const insetBottom = to.height - visibleHeight - insetTop;

  const x = from.left - to.left - insetX * scale;
  const y = from.top - to.top - insetTop * scale;

  return [
    {
      transformOrigin: "0 0",
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      clipPath: `inset(${insetTop}px ${insetX}px ${insetBottom}px ${insetX}px round ${RADIUS / scale}px)`,
    },
    {
      transformOrigin: "0 0",
      transform: "translate(0px, 0px) scale(1)",
      clipPath: `inset(0px 0px 0px 0px round ${RADIUS}px)`,
    },
  ];
}

export async function flyPhoto(
  element: HTMLElement,
  origin: Rect,
  direction: "in" | "out",
) {
  if (typeof element.animate !== "function") return;

  element.getAnimations().forEach((animation) => animation.cancel());
  const frames = flightKeyframes(origin, element.getBoundingClientRect());
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  await element.animate(direction === "in" ? frames : frames.reverse(), {
    duration: reduceMotion
      ? 0
      : direction === "in"
        ? FLIGHT_IN_MS
        : FLIGHT_OUT_MS,
    easing: FLIGHT_EASING,
    fill: direction === "out" ? "forwards" : "none",
  }).finished;
}
