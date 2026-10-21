import type { ReactNode } from "react";
import { Logo } from "@/components/common/logo";
import { LINKS } from "@/lib/constants/links";

type DashboardHeaderProps = {
  account: ReactNode;
};

export function DashboardHeader({ account }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-10">
        <Logo href={LINKS.protected.dashboard} />
        {account}
      </div>
    </header>
  );
}
