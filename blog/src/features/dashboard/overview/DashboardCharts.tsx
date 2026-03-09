"use client";

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

// ─── Traffic Chart ───

const trafficData = [
  { month: "Jan", views: 1200 },
  { month: "Feb", views: 1900 },
  { month: "Mar", views: 1500 },
  { month: "Apr", views: 2100 },
  { month: "May", views: 2300 },
  { month: "Jun", views: 1800 },
  { month: "Jul", views: 3000 },
  { month: "Aug", views: 4200 },
  { month: "Sep", views: 3800 },
  { month: "Oct", views: 3200 },
  { month: "Nov", views: 3600 },
  { month: "Dec", views: 4800 },
];

const trafficConfig = {
  views: {
    label: "Page Views",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// ─── Posts by Category Chart ───

const categoryData = [
  { category: "Programming", posts: 12 },
  { category: "Web Dev", posts: 8 },
  { category: "Design", posts: 5 },
  { category: "Technology", posts: 7 },
  { category: "Career", posts: 3 },
];

const categoryConfig = {
  posts: {
    label: "Posts",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// ─── Status Distribution Chart ───

const statusData = [
  { name: "Published", value: 24, fill: "hsl(var(--chart-1))" },
  { name: "Draft", value: 8, fill: "hsl(var(--chart-3))" },
  { name: "Archived", value: 3, fill: "hsl(var(--chart-5))" },
];

const statusConfig = {
  Published: { label: "Published", color: "hsl(var(--chart-1))" },
  Draft: { label: "Draft", color: "hsl(var(--chart-3))" },
  Archived: { label: "Archived", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Traffic Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Page Views</CardTitle>
          <CardDescription>Monthly page views over the past year</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Post Status</CardTitle>
          <CardDescription>Distribution by status</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Category Bar Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Posts by Category</CardTitle>
          <CardDescription>Number of posts in each category</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
