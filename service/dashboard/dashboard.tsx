import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { getSession } from "@/lib/dal/auth-checker";
import { LINKS } from "@/lib/constants/links";
import { DashboardView } from "@/service/dashboard/dashboard-view";
import { sampleScores } from "@/service/dashboard/sample-scores";

export function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function loadScores() {
  const now = Date.now();
  return { now, entries: sampleScores(now) };
}

export async function DashboardContent() {
  const session = await getSession();
  if (!session) redirect(LINKS.guest.signIn);

  const { now, entries } = await loadScores();
  return <DashboardView name={session.user.name} now={now} entries={entries} />;
}
