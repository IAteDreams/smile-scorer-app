import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeaderAuthActions } from "@/service/marketing/header-auth-actions";

export const metadata: Metadata = {
  title: "Smilescore · How big is your smile, really?",
  description:
    "Upload a photo and get a smile score from 0 to 100 in seconds, then track how your smiles change over time.",
};

export default function HomePage() {
  return (
    <>
      <SiteHeader actions={<HeaderAuthActions />} />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
      </main>
      <SiteFooter />
    </>
  );
}
