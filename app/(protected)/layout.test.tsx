import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProtectedLayout from "./layout";

vi.mock("@/service/dashboard/header-account", () => ({
  HeaderAccount: () => <span>account</span>,
}));

describe("ProtectedLayout", () => {
  it("wraps the page with the dashboard header and the site footer", () => {
    render(
      <ProtectedLayout params={Promise.resolve({})}>
        <p>dashboard</p>
      </ProtectedLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("account");
    expect(screen.getByRole("main")).toHaveTextContent("dashboard");
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "© 2026 Smilescore",
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
  });
});
