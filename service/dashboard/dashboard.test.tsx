import { Suspense, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardView } from "@/service/dashboard/dashboard-view";

import { Dashboard, DashboardContent } from "./dashboard";

const { getSession, redirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/lib/dal/auth-checker", () => ({ getSession }));
vi.mock("next/navigation", () => ({ redirect }));

type ViewElement = ReactElement<{
  name: string;
  now: number;
  entries: unknown[];
}>;

describe("Dashboard", () => {
  it("streams the dashboard behind a skeleton", () => {
    const element = Dashboard() as ReactElement<{
      fallback: ReactElement;
      children: ReactElement;
    }>;
    expect(element.type).toBe(Suspense);
    expect(element.props.fallback.type).toBe(DashboardSkeleton);
    expect(element.props.children.type).toBe(DashboardContent);
  });
});

describe("DashboardContent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes the user's name and scores to the view", async () => {
    getSession.mockResolvedValue({ user: { name: "Maria Reyes" } });
    const element = (await DashboardContent()) as ViewElement;

    expect(element.type).toBe(DashboardView);
    expect(element.props.name).toBe("Maria Reyes");
    expect(element.props.entries).toHaveLength(24);
    expect(element.props.now).toBeCloseTo(Date.now(), -4);
  });

  it("sends a signed-out visitor to sign in", async () => {
    getSession.mockResolvedValue(null);
    await expect(DashboardContent()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });
});
