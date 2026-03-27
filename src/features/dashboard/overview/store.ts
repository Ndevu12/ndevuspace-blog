import { create } from "zustand";
import { formatDistanceToNow } from "date-fns";
import { FileText, Eye, Heart } from "lucide-react";
import { dashboardOverviewService } from "@/features/dashboard/overview/services/dashboardOverviewService";
import type { BlogDashboardTimeseriesPoint } from "@/types/admin";

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  description: string;
}

interface Activity {
  id: string;
  text: string;
  time: string;
}

interface TrafficDataPoint {
  month: string;
  views: number;
}

interface CategoryDataPoint {
  category: string;
  posts: number;
}

interface StatusDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface DashboardOverviewState {
  stats: StatCard[];
  statsLoading: boolean;
  activities: Activity[];
  activitiesLoading: boolean;
  trafficData: TrafficDataPoint[];
  categoryData: CategoryDataPoint[];
  statusData: StatusDataPoint[];
  chartsLoading: boolean;

  // Actions
  loadStats: () => Promise<void>;
  loadRecentActivity: () => Promise<void>;
  loadCharts: () => Promise<void>;
  loadOverview: () => Promise<void>;
}

const DEFAULT_STATS: StatCard[] = [
  { title: "Total Posts", value: 0, icon: FileText, description: "All blog posts" },
  { title: "Published", value: 0, icon: Eye, description: "Live articles" },
  { title: "Drafts", value: 0, icon: FileText, description: "Unpublished drafts" },
  { title: "Engagement", value: 0, icon: Heart, description: "Total interactions" },
];

const STATUS_COLORS: Record<string, string> = {
  Published: "hsl(var(--chart-1))",
  Draft: "hsl(var(--chart-3))",
  Archived: "hsl(var(--chart-5))",
};

function formatTimeseriesMonth(point: BlogDashboardTimeseriesPoint): string {
  return new Date(point.bucket_start).toLocaleDateString("en-US", { month: "short" });
}

export const useDashboardOverviewStore = create<DashboardOverviewState>(
  (set) => ({
    stats: DEFAULT_STATS,
    statsLoading: true,
    activities: [],
    activitiesLoading: true,
    trafficData: [],
    categoryData: [],
    statusData: [],
    chartsLoading: true,

    loadStats: async () => {
      set({ statsLoading: true });
      try {
        const stats = await dashboardOverviewService.getOverviewStats();

        set({
          stats: [
            {
              title: "Total Posts",
              value: stats.total_blogs,
              icon: FileText,
              description: "All blog posts",
            },
            {
              title: "Published",
              value: stats.published_count,
              icon: Eye,
              description: "Live articles",
            },
            {
              title: "Drafts",
              value: stats.draft_count,
              icon: FileText,
              description: "Unpublished drafts",
            },
            {
              title: "Engagement",
              value: stats.total_likes,
              icon: Heart,
              description: "Total interactions",
            },
          ],
          statsLoading: false,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        set({ stats: DEFAULT_STATS, statsLoading: false });
      }
    },

    loadRecentActivity: async () => {
      set({ activitiesLoading: true });
      try {
        const response = await dashboardOverviewService.getOverviewRecentActivity(5);

        const recentActivities: Activity[] = response.items.map((item) => ({
          id: item.id,
          text: `Updated "${item.title}"`,
          time: formatDistanceToNow(new Date(item.updated_at), {
            addSuffix: true,
          }),
        }));

        set({ activities: recentActivities, activitiesLoading: false });
      } catch (error) {
        console.error("Failed to load recent activity:", error);
        set({ activities: [], activitiesLoading: false });
      }
    },

    loadCharts: async () => {
      set({ chartsLoading: true });
      try {
        const [stats, timeseries, categories] = await Promise.all([
          dashboardOverviewService.getOverviewStats(),
          dashboardOverviewService.getOverviewTimeseries({
            metric: "views",
            start: null,
            end: null,
            bucket: "month",
          }),
          dashboardOverviewService.getOverviewCategoryDistribution(),
        ]);

        const statusData: StatusDataPoint[] = [
          { name: "Published", value: stats.published_count, fill: STATUS_COLORS.Published },
          { name: "Draft", value: stats.draft_count, fill: STATUS_COLORS.Draft },
          { name: "Archived", value: stats.archived_count, fill: STATUS_COLORS.Archived },
        ].filter((item) => item.value > 0);

        const trafficData: TrafficDataPoint[] = timeseries.points.map((point) => ({
          month: formatTimeseriesMonth(point),
          views: point.value,
        }));

        const categoryData: CategoryDataPoint[] = categories.categories.map((item) => ({
          category: item.category,
          posts: item.posts,
        }));

        set({
          trafficData,
          categoryData,
          statusData,
          chartsLoading: false,
        });
      } catch (error) {
        console.error("Failed to load chart data:", error);
        set({
          trafficData: [],
          categoryData: [],
          statusData: [],
          chartsLoading: false,
        });
      }
    },

    loadOverview: async () => {
      set({
        statsLoading: true,
        activitiesLoading: true,
        chartsLoading: true,
      });

      try {
        const response = await dashboardOverviewService.getOverviewDashboardData({
          activityLimit: 5,
          timeseries: {
            metric: "views",
            start: null,
            end: null,
            bucket: "month",
          },
        });

        const stats: StatCard[] = [
          {
            title: "Total Posts",
            value: response.stats.total_blogs,
            icon: FileText,
            description: "All blog posts",
          },
          {
            title: "Published",
            value: response.stats.published_count,
            icon: Eye,
            description: "Live articles",
          },
          {
            title: "Drafts",
            value: response.stats.draft_count,
            icon: FileText,
            description: "Unpublished drafts",
          },
          {
            title: "Engagement",
            value: response.stats.total_likes,
            icon: Heart,
            description: "Total interactions",
          },
        ];

        const activities: Activity[] = response.activity.items.map((item) => ({
          id: item.id,
          text: `Updated "${item.title}"`,
          time: formatDistanceToNow(new Date(item.updated_at), {
            addSuffix: true,
          }),
        }));

        const trafficData: TrafficDataPoint[] = response.timeseries.points.map((point) => ({
          month: formatTimeseriesMonth(point),
          views: point.value,
        }));

        const categoryData: CategoryDataPoint[] = response.categoryDistribution.categories.map(
          (item) => ({
            category: item.category,
            posts: item.posts,
          })
        );

        const statusData: StatusDataPoint[] = [
          {
            name: "Published",
            value: response.stats.published_count,
            fill: STATUS_COLORS.Published,
          },
          {
            name: "Draft",
            value: response.stats.draft_count,
            fill: STATUS_COLORS.Draft,
          },
          {
            name: "Archived",
            value: response.stats.archived_count,
            fill: STATUS_COLORS.Archived,
          },
        ].filter((item) => item.value > 0);

        set({
          stats,
          activities,
          trafficData,
          categoryData,
          statusData,
          statsLoading: false,
          activitiesLoading: false,
          chartsLoading: false,
        });
      } catch (error) {
        console.error("Failed to load dashboard overview:", error);
        set({
          stats: DEFAULT_STATS,
          activities: [],
          trafficData: [],
          categoryData: [],
          statusData: [],
          statsLoading: false,
          activitiesLoading: false,
          chartsLoading: false,
        });
      }
    },
  })
);
