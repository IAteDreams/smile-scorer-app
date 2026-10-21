import { Suspense } from "react";
import {
  HeaderActions,
  HeaderActionsSkeleton,
} from "@/components/marketing/header-actions";
import { getSession } from "@/lib/dal/auth-checker";

export function HeaderAuthActions() {
  return (
    <Suspense fallback={<HeaderActionsSkeleton />}>
      <SessionActions />
    </Suspense>
  );
}

export async function SessionActions() {
  const session = await getSession();
  return <HeaderActions signedIn={!!session} />;
}
