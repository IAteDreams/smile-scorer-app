import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { getSession } from "@/lib/dal/auth-checker";
import { getScoreSummary, listScores } from "@/lib/dal/score";
import { LINKS } from "@/lib/constants/links";
import { DashboardView } from "@/service/dashboard/dashboard-view";

export function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function loadScores(userId: string) {
  const now = Date.now();
  const [summary, history] = await Promise.all([
    getScoreSummary(userId, new Date(now)),
    listScores(userId, { query: "", sort: "newest", page: 0 }),
  ]);
  return { now, summary, history };
}

export async function DashboardContent() {
  const session = await getSession();
  if (!session) redirect(LINKS.guest.signIn);

  const { now, summary, history } = await loadScores(session.user.id);
  return (
    <DashboardView
      name={session.user.name}
      now={now}
      summary={summary}
      history={history}
    />
  );
}
