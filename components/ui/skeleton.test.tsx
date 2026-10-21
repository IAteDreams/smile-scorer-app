import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("is a pulsing, decorative placeholder", () => {
    const { container } = render(<Skeleton className="h-9 w-44" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveClass(
      "animate-pulse",
      "bg-muted",
      "h-9",
      "w-44",
    );
  });

  it("lets a caller change the shape", () => {
    const { container } = render(<Skeleton className="rounded-full" />);
    expect(container.firstChild).toHaveClass("rounded-full");
    expect(container.firstChild).not.toHaveClass("rounded-lg");
  });
});
