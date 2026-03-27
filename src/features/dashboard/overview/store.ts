import { create } from "zustand";
import { formatDistanceToNow } from "date-fns";
import type { BlogPost } from "@/types/blog";
import { FileText, Eye, Heart } from "lucide-react";
import { dashboardBlogService } from "@/features/dashboard/services/dashboardBlogService";

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

interface DashboardOverviewState {
  stats: StatCard[];
  statsLoading: boolean;
  activities: Activity[];
  activitiesLoading: boolean;

  // Actions
  loadStats: () => Promise<void>;
  loadRecentActivity: () => Promise<void>;
}

export const useDashboardOverviewStore = create<DashboardOverviewState>(
  (set) => ({
    stats: [],
    statsLoading: true,
    activities: [],
    activitiesLoading: true,

    loadStats: async () => {
      set({ statsLoading: true });
      try {
        const response = await dashboardBlogService.getAdminBlogs({
          page: 1,
          limit: 1,
          status: "",
          category: "",
          search: "",
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        const totalBlogs = response.pagination.totalBlogs;

        const publishedResponse = await dashboardBlogService.getAdminBlogs({
          page: 1,
          limit: 1,
          status: "published",
          category: "",
          search: "",
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        const publishedBlogs = publishedResponse.pagination.totalBlogs;
        const draftBlogs = totalBlogs - publishedBlogs;

        set({
          stats: [
            {
              title: "Total Posts",
              value: totalBlogs,
              icon: FileText,
              trend: 12,
              description: "All blog posts",
            },
            {
              title: "Published",
              value: publishedBlogs,
              icon: Eye,
              trend: 8,
              description: "Live articles",
            },
            {
              title: "Drafts",
              value: draftBlogs,
              icon: FileText,
              trend: -2,
              description: "Unpublished drafts",
            },
            {
              title: "Engagement",
              value: 0,
              icon: Heart,
              trend: 15,
              description: "Total interactions",
            },
          ],
          statsLoading: false,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        set({
          stats: [
            { title: "Total Posts", value: 0, icon: FileText, description: "All blog posts" },
            { title: "Published", value: 0, icon: Eye, description: "Live articles" },
            { title: "Drafts", value: 0, icon: FileText, description: "Unpublished drafts" },
            { title: "Engagement", value: 0, icon: Heart, description: "Total interactions" },
          ],
          statsLoading: false,
        });
      }
    },

    loadRecentActivity: async () => {
      set({ activitiesLoading: true });
      try {
        const response = await dashboardBlogService.getAdminBlogs({
          page: 1,
          limit: 5,
          status: "",
          category: "",
          search: "",
          sortBy: "updatedAt",
          sortOrder: "desc",
        });

        const recentActivities: Activity[] = response.blogs.map(
          (blog: BlogPost) => ({
            id: blog.id,
            text: `Updated "${blog.title}"`,
            time: blog.updatedAt
              ? formatDistanceToNow(new Date(blog.updatedAt), {
                  addSuffix: true,
                })
              : formatDistanceToNow(new Date(blog.createdAt), {
                  addSuffix: true,
                }),
          })
        );

        set({ activities: recentActivities, activitiesLoading: false });
      } catch (error) {
        console.error("Failed to load recent activity:", error);
        set({ activities: [], activitiesLoading: false });
      }
    },
  })
);
