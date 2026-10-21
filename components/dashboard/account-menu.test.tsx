import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountMenu, AccountMenuSkeleton } from "./account-menu";

const openMenu = async () => {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Account menu for maria@example.com",
    }),
  );
  return screen.findByRole("menuitem", { name: /Sign/ });
};

describe("AccountMenu", () => {
  it("shows the user's email and initials", () => {
    render(
      <AccountMenu
        name="Maria Reyes"
        email="maria@example.com"
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
    expect(screen.getByText("MR")).toBeInTheDocument();
  });

  it("signs out from the menu", async () => {
    const onSignOut = vi.fn();
    render(
      <AccountMenu
        name="Maria Reyes"
        email="maria@example.com"
        onSignOut={onSignOut}
      />,
    );

    const item = await openMenu();
    expect(item).toHaveTextContent("Sign out");
    fireEvent.click(item);
    expect(onSignOut).toHaveBeenCalled();
  });

  it("shows progress while signing out", async () => {
    render(
      <AccountMenu
        name="Maria Reyes"
        email="maria@example.com"
        pending
        onSignOut={vi.fn()}
      />,
    );
    const item = await openMenu();
    expect(item).toHaveTextContent("Signing out…");
    expect(item).toHaveAttribute("aria-disabled", "true");
  });
});

describe("AccountMenuSkeleton", () => {
  it("is hidden from assistive tech", () => {
    const { container } = render(<AccountMenuSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
