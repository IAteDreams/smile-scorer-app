import { Suspense, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardView } from "@/service/dashboard/dashboard-view";

import { Dashboard, DashboardContent } from "./dashboard";

const { getSession, redirect, listScores, getScoreSummary } = vi.hoisted(
  () => ({
    getScoreSummary: vi.fn(),
    getSession: vi.fn(),
    listScores: vi.fn(),
    redirect: vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    }),
  }),
);

vi.mock("@/lib/dal/auth-checker", () => ({ getSession }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/dal/score", () => ({ listScores, getScoreSummary }));

type ViewElement = ReactElement<{
  name: string;
  now: number;
  summary: unknown;
  history: unknown;
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

  it("loads the totals and the first history page for the view", async () => {
    const summary = { count: 9 };
    const history = { items: [], total: 9, page: 0, pageSize: 6 };
    getSession.mockResolvedValue({
      user: { id: "user-1", name: "Maria Reyes" },
    });
    getScoreSummary.mockResolvedValue(summary);
    listScores.mockResolvedValue(history);
    const element = (await DashboardContent()) as ViewElement;

    expect(element.type).toBe(DashboardView);
    expect(element.props).toMatchObject({
      name: "Maria Reyes",
      summary,
      history,
    });
    expect(element.props.now).toBeCloseTo(Date.now(), -4);
    expect(getScoreSummary).toHaveBeenCalledWith(
      "user-1",
      new Date(element.props.now),
    );
    expect(listScores).toHaveBeenCalledWith("user-1", {
      query: "",
      sort: "newest",
      page: 0,
    });
  });

  it("sends a signed-out visitor to sign in", async () => {
    getSession.mockResolvedValue(null);
    await expect(DashboardContent()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/sign-in");
    expect(listScores).not.toHaveBeenCalled();
    expect(getScoreSummary).not.toHaveBeenCalled();
  });
});
