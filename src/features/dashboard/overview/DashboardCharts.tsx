"use client";

import { useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverviewStore } from "./store";

const trafficConfig = {
  views: {
    label: "Page Views",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const categoryConfig = {
  posts: {
    label: "Posts",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const statusConfig = {
  Published: { label: "Published", color: "hsl(var(--chart-1))" },
  Draft: { label: "Draft", color: "hsl(var(--chart-3))" },
  Archived: { label: "Archived", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function DashboardCharts() {
  const {
    trafficData,
    categoryData,
    statusData,
    chartsLoading: loading,
    loadCharts,
  } = useDashboardOverviewStore();

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Traffic Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Page Views</CardTitle>
          <CardDescription>Monthly page views over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          {trafficData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No page view data available
            </p>
          ) : (
            <ChartContainer config={trafficConfig} className="h-[300px] w-full">
              <AreaChart data={trafficData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${value / 1000}k` : String(value)
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-views)"
                  fill="var(--color-views)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Post Status</CardTitle>
          <CardDescription>Distribution by status</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No status distribution available
            </p>
          ) : (
            <ChartContainer config={statusConfig} className="h-[300px] w-full">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Bar Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Posts by Category</CardTitle>
          <CardDescription>Number of posts in each category</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No category data available
            </p>
          ) : (
            <ChartContainer config={categoryConfig} className="h-[300px] w-full">
              <BarChart data={categoryData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="posts"
                  fill="var(--color-posts)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
