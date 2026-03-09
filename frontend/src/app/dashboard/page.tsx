import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Convert YouTube videos into SEO-optimized content using AI.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
