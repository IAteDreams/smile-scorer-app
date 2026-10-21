import { describe, expect, it } from "vitest";

import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "./legal";

describe.each([
  ["PRIVACY_POLICY", PRIVACY_POLICY],
  ["TERMS_OF_SERVICE", TERMS_OF_SERVICE],
])("%s", (_, document) => {
  const ids = document.sections.map((section) => section.id);

  it("has unique section anchors", () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses anchors that are safe in a URL", () => {
    ids.forEach((id) => expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/));
  });

  it("gives every section some text", () => {
    document.sections.forEach((section) =>
      expect(section.paragraphs.length).toBeGreaterThan(0),
    );
  });
});
