import { SiteHeader } from "@/components/marketing/site-header";
import { HeaderAuthActions } from "@/service/marketing/header-auth-actions";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader actions={<HeaderAuthActions />} />
      <main className="flex-1">{children}</main>
    </>
  );
}
