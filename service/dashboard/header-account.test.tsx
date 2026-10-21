import { render, screen } from "@testing-library/react";
import { Suspense, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountMenuSkeleton } from "@/components/dashboard/account-menu";

import { HeaderAccount, SessionAccount } from "./header-account";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/dal/auth-checker", () => ({ getSession }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/auth-client", () => ({ signOut: vi.fn() }));

describe("HeaderAccount", () => {
  it("streams the account menu behind a skeleton", () => {
    const element = HeaderAccount() as ReactElement<{
      fallback: ReactElement;
      children: ReactElement;
    }>;
    expect(element.type).toBe(Suspense);
    expect(element.props.fallback.type).toBe(AccountMenuSkeleton);
    expect(element.props.children.type).toBe(SessionAccount);
  });
});

describe("SessionAccount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the signed-in user", async () => {
    getSession.mockResolvedValue({
      user: { name: "Maria Reyes", email: "maria@example.com" },
    });
    render(await SessionAccount());
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
  });

  it("keeps the placeholder without a session", async () => {
    getSession.mockResolvedValue(null);
    const { container } = render(await SessionAccount());
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
