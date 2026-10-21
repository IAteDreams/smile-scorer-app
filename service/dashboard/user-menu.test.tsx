import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserMenu } from "./user-menu";

const { signOut, push, refresh, toast } = vi.hoisted(() => ({
  toast: { error: vi.fn() },
  signOut: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ signOut }));
vi.mock("sonner", () => ({ toast }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

describe("UserMenu", () => {
  beforeEach(() => vi.clearAllMocks());

  it("signs out and returns to the sign-in page", async () => {
    signOut.mockResolvedValue({ data: { success: true }, error: null });
    render(<UserMenu name="Maria Reyes" email="maria@example.com" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Account menu for maria@example.com",
      }),
    );
    const item = await screen.findByRole("menuitem", { name: /Sign out/ });
    await act(async () => fireEvent.click(item));

    expect(signOut).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/sign-in");
    expect(refresh).toHaveBeenCalled();
  });

  it("stays signed in and shows an error toast when sign-out fails", async () => {
    signOut.mockResolvedValue({ data: null, error: { message: "boom" } });
    render(<UserMenu name="Maria Reyes" email="maria@example.com" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Account menu for maria@example.com",
      }),
    );
    const item = await screen.findByRole("menuitem", { name: /Sign out/ });
    await act(async () => fireEvent.click(item));

    expect(toast.error).toHaveBeenCalledWith(
      "We couldn't sign you out. Try again.",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
