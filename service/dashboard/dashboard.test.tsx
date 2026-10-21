import { Suspense, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardView } from "@/service/dashboard/dashboard-view";

import { Dashboard, DashboardContent } from "./dashboard";

const { getSession, redirect, listScores } = vi.hoisted(() => ({
  getSession: vi.fn(),
  listScores: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/lib/dal/auth-checker", () => ({ getSession }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/dal/score", () => ({ listScores }));

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

  it("passes the user's name and saved scores to the view", async () => {
    const entries = [{ id: "photo-1" }];
    getSession.mockResolvedValue({
      user: { id: "user-1", name: "Maria Reyes" },
    });
    listScores.mockResolvedValue(entries);
    const element = (await DashboardContent()) as ViewElement;

    expect(listScores).toHaveBeenCalledWith("user-1");
    expect(element.type).toBe(DashboardView);
    expect(element.props.name).toBe("Maria Reyes");
    expect(element.props.entries).toBe(entries);
    expect(element.props.now).toBeCloseTo(Date.now(), -4);
  });

  it("sends a signed-out visitor to sign in", async () => {
    getSession.mockResolvedValue(null);
    await expect(DashboardContent()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/sign-in");
    expect(listScores).not.toHaveBeenCalled();
  });
});
