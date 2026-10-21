import type { Metadata } from "next";
import { Dashboard } from "@/service/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Dashboard · Smilescore",
};

export default function DashboardPage() {
  return <Dashboard />;
}
