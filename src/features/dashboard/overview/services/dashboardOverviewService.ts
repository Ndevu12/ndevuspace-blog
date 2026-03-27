import { dashboardBlogService } from "@/features/dashboard/services/dashboardBlogService";
import type {
  BlogDashboardCategoryDistributionResponse,
  BlogDashboardRecentActivityResponse,
  BlogDashboardStatsResponse,
  BlogDashboardTimeseriesBucket,
  BlogDashboardTimeseriesMetric,
  BlogDashboardTimeseriesResponse,
} from "@/types/admin";

export interface DashboardOverviewTimeseriesInput {
  metric: BlogDashboardTimeseriesMetric;
  start: string | null;
  end: string | null;
  bucket: BlogDashboardTimeseriesBucket;
}

export interface DashboardOverviewAggregateInput {
  activityLimit?: number;
  timeseries: DashboardOverviewTimeseriesInput;
}

export interface DashboardOverviewAggregateResponse {
  stats: BlogDashboardStatsResponse;
  activity: BlogDashboardRecentActivityResponse;
  timeseries: BlogDashboardTimeseriesResponse;
  categoryDistribution: BlogDashboardCategoryDistributionResponse;
}

export async function getOverviewStats(): Promise<BlogDashboardStatsResponse> {
  return dashboardBlogService.getDashboardStats();
}

export async function getOverviewRecentActivity(
  limit: number = 5
): Promise<BlogDashboardRecentActivityResponse> {
  return dashboardBlogService.getDashboardRecentActivity(limit);
}

export async function getOverviewTimeseries(
  input: DashboardOverviewTimeseriesInput
): Promise<BlogDashboardTimeseriesResponse> {
  return dashboardBlogService.getDashboardTimeseries(
    input.metric,
    input.start,
    input.end,
    input.bucket
  );
}

export async function getOverviewCategoryDistribution(): Promise<BlogDashboardCategoryDistributionResponse> {
  return dashboardBlogService.getDashboardCategoryDistribution();
}

export async function getOverviewDashboardData(
  input: DashboardOverviewAggregateInput
): Promise<DashboardOverviewAggregateResponse> {
  const [stats, activity, timeseries, categoryDistribution] = await Promise.all([
    getOverviewStats(),
    getOverviewRecentActivity(input.activityLimit ?? 5),
    getOverviewTimeseries(input.timeseries),
    getOverviewCategoryDistribution(),
  ]);

  return {
    stats,
    activity,
    timeseries,
    categoryDistribution,
  };
}

export const dashboardOverviewService = {
  getOverviewDashboardData,
  getOverviewStats,
  getOverviewRecentActivity,
  getOverviewTimeseries,
  getOverviewCategoryDistribution,
};
