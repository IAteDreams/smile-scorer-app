import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("renders a titled, described section", () => {
    render(
      <Card as="section" aria-labelledby="t">
        <CardHeader>
          <CardTitle id="t">Score over time</CardTitle>
          <CardDescription>Last 14 uploads</CardDescription>
          <CardAction>
            <button type="button">All</button>
          </CardAction>
        </CardHeader>
      </Card>,
    );
    const section = screen.getByRole("region", { name: "Score over time" });
    expect(section).toHaveClass("rounded-xl", "border", "bg-card");
    expect(
      screen.getByRole("heading", { level: 2, name: "Score over time" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Last 14 uploads").tagName).toBe("P");
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("renders as the element the markup needs", () => {
    render(
      <ul>
        <Card as="li">Step</Card>
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("data-slot", "card");
  });

  it("is a div by default and merges classes", () => {
    const { container } = render(<Card className="p-5">Stat</Card>);
    expect((container.firstChild as HTMLElement).tagName).toBe("DIV");
    expect(container.firstChild).toHaveClass("p-5", "bg-card");
  });

  it("can use a lower heading level", () => {
    render(<CardTitle as="h3">Upload a photo</CardTitle>);
    expect(
      screen.getByRole("heading", { level: 3, name: "Upload a photo" }),
    ).toBeInTheDocument();
  });
});
