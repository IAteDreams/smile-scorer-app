import { render, screen } from "@testing-library/react";
import { Suspense, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderActionsSkeleton } from "@/components/marketing/header-actions";

import { HeaderAuthActions, SessionActions } from "./header-auth-actions";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/dal/auth-checker", () => ({ getSession }));

describe("HeaderAuthActions", () => {
  it("streams the session buttons behind a skeleton fallback", () => {
    const element = HeaderAuthActions() as ReactElement<{
      fallback: ReactElement;
      children: ReactElement;
    }>;
    expect(element.type).toBe(Suspense);
    expect(element.props.fallback.type).toBe(HeaderActionsSkeleton);
    expect(element.props.children.type).toBe(SessionActions);
  });
});

describe("SessionActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows visitor buttons without a session", async () => {
    getSession.mockResolvedValue(null);
    render(await SessionActions());
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows the dashboard link with a session", async () => {
    getSession.mockResolvedValue({ user: { id: "1" }, session: {} });
    render(await SessionActions());
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }),
    ).toBeInTheDocument();
  });
});
