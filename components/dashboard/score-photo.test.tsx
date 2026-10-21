import { afterEach, describe, expect, it } from "vitest";

import { findThumbnail } from "./score-photo";

const thumbnail = (id: string, onScreen: boolean) => {
  const element = document.createElement("div");
  element.dataset.thumbnail = id;
  // jsdom has no layout; a hidden element (display: none) has no client rects.
  element.getClientRects = () =>
    (onScreen ? [new DOMRect(0, 0, 44, 44)] : []) as unknown as DOMRectList;
  document.body.append(element);
  return element;
};

describe("findThumbnail", () => {
  afterEach(() => document.body.replaceChildren());

  it("picks the copy that is on screen", () => {
    thumbnail("1", false);
    const shown = thumbnail("1", true);
    thumbnail("2", true);
    expect(findThumbnail("1")).toBe(shown);
  });

  it("returns null when no copy is on screen", () => {
    thumbnail("1", false);
    expect(findThumbnail("1")).toBeNull();
    expect(findThumbnail("missing")).toBeNull();
  });
});
