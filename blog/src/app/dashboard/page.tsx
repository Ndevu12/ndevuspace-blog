import type { Metadata } from "next";
import { DashboardStats } from "@/features/dashboard/overview/DashboardStats";
import { DashboardCharts } from "@/features/dashboard/overview/DashboardCharts";
import { RecentActivity } from "@/features/dashboard/overview/RecentActivity";

export const metadata: Metadata = {
  title: "Dashboard — Overview",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your blog performance and activity.
        </p>
      </div>

      <DashboardStats />
      <DashboardCharts />
      <RecentActivity />
    </div>
  );
}
