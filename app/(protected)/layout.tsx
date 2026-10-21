import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeaderAccount } from "@/service/dashboard/header-account";

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <DashboardHeader account={<HeaderAccount />} />
      <main className="flex-1 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-10">{children}</div>
      </main>
      <div className="border-t">
        <SiteFooter className="sm:px-10" />
      </div>
    </>
  );
}
