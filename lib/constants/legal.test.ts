import { describe, expect, it } from "vitest";

import { PRIVACY_POLICY } from "./legal";

describe("PRIVACY_POLICY", () => {
  const ids = PRIVACY_POLICY.sections.map((section) => section.id);

  it("has unique section anchors", () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses anchors that are safe in a URL", () => {
    ids.forEach((id) => expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/));
  });

  it("gives every section some text", () => {
    PRIVACY_POLICY.sections.forEach((section) =>
      expect(section.paragraphs.length).toBeGreaterThan(0),
    );
  });
});
