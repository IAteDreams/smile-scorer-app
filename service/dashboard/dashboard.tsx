import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { getSession } from "@/lib/dal/auth-checker";
import { listScores } from "@/lib/dal/score";
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
  const entries = await listScores(userId);
  return { now: Date.now(), entries };
}

export async function DashboardContent() {
  const session = await getSession();
  if (!session) redirect(LINKS.guest.signIn);

  const { now, entries } = await loadScores(session.user.id);
  return <DashboardView name={session.user.name} now={now} entries={entries} />;
}
