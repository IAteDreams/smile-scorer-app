import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/legal/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy · Smilescore",
  description:
    "What Smilescore collects, how photos are analyzed, how long data is kept, and your rights.",
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
