import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardHeader } from "./dashboard-header";
import { DashboardIntro } from "./dashboard-intro";
import { DashboardSkeleton } from "./dashboard-skeleton";

describe("DashboardHeader", () => {
  it("links the logo to the dashboard and shows the account slot", () => {
    render(<DashboardHeader account={<span>me</span>} />);
    expect(screen.getByRole("link", { name: "Smilescore" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByText("me")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("DashboardIntro", () => {
  it("greets the user and offers an upload", () => {
    const onUpload = vi.fn();
    render(
      <DashboardIntro
        title="Good afternoon, Maria"
        summary="You've scored 24 photos."
        onUpload={onUpload}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Good afternoon, Maria" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You've scored 24 photos.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Upload photo" }));
    expect(onUpload).toHaveBeenCalled();
  });
});

describe("DashboardSkeleton", () => {
  it("announces that the dashboard is loading", () => {
    render(<DashboardSkeleton />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading your dashboard…",
    );
  });
});
