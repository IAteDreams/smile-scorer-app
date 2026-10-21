import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FaceBox } from "./face-box";

describe("FaceBox", () => {
  it("places the box from Rekognition's 0–1 coordinates", () => {
    render(
      <FaceBox
        box={{ left: 0.25, top: 0.5, width: 0.125, height: 0.2 }}
        confidence="99.8%"
      />,
    );
    const box = screen.getByText("FACE · 99.8%").parentElement;
    expect(box).toHaveStyle({
      left: "25%",
      top: "50%",
      width: "12.5%",
      height: "20%",
    });
  });

  it("is decorative and accepts extra classes", () => {
    const { container } = render(
      <FaceBox
        box={{ left: 0, top: 0, width: 1, height: 1 }}
        confidence="90.0%"
        className="opacity-0"
      />,
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveClass("absolute", "opacity-0");
  });
});
