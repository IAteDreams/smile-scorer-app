import { Suspense } from "react";
import { AccountMenuSkeleton } from "@/components/dashboard/account-menu";
import { getSession } from "@/lib/dal/auth-checker";
import { UserMenu } from "@/service/dashboard/user-menu";

export function HeaderAccount() {
  return (
    <Suspense fallback={<AccountMenuSkeleton />}>
      <SessionAccount />
    </Suspense>
  );
}

export async function SessionAccount() {
  const session = await getSession();
  if (!session) return <AccountMenuSkeleton />;
  return <UserMenu name={session.user.name} email={session.user.email} />;
}
