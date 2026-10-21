import type { Metadata } from "next";
import { TermsOfService } from "@/components/legal/terms-of-service";

export const metadata: Metadata = {
  title: "Terms of Service · Smilescore",
  description:
    "The rules for using Smilescore: your account, your photos, what scores mean and acceptable use.",
};

export default function TermsPage() {
  return <TermsOfService />;
}
