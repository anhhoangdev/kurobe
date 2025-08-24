"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

// Mock data - in real app this would come from API
const metrics = [
  {
    title: "Total Revenue",
    value: 45234.89,
    previousValue: 39482.23,
    format: "currency" as const,
    icon: DollarSign,
    trend: "up" as const,
  },
  {
    title: "Active Users",
    value: 2345,
    previousValue: 2103,
    format: "number" as const,
    icon: Users,
    trend: "up" as const,
  },
  {
    title: "Conversion Rate",
    value: 12.5,
    previousValue: 14.2,
    format: "percentage" as const,
    icon: TrendingUp,
    trend: "down" as const,
  },
  {
    title: "Total Sessions",
    value: 54321,
    previousValue: 48192,
    format: "number" as const,
    icon: BarChart3,
    trend: "up" as const,
  },
];

const recentActivities = [
  {
    id: 1,
    title: "New dashboard created",
    description: "Marketing Performance Q4 2024",
    timestamp: "2 minutes ago",
    type: "dashboard",
  },
  {
    id: 2,
    title: "Data source connected",
    description: "PostgreSQL production database",
    timestamp: "15 minutes ago",
    type: "connection",
  },
  {
    id: 3,
    title: "Report generated",
    description: "Monthly revenue analysis",
    timestamp: "1 hour ago",
    type: "report",
  },
  {
    id: 4,
    title: "Team member added",
    description: "sarah@company.com joined as Analyst",
    timestamp: "3 hours ago",
    type: "team",
  },
];

function MetricCard({ 
  title, 
  value, 
  previousValue, 
  format, 
  icon: Icon, 
  trend 
}: typeof metrics[0]) {
  const changePercent = ((value - previousValue) / previousValue) * 100;
  const isPositive = changePercent > 0;

  let formattedValue: string;
  let formattedChange: string;

  switch (format) {
    case "currency":
      formattedValue = formatCurrency(value);
      formattedChange = `${isPositive ? "+" : ""}${formatCurrency(value - previousValue)}`;
      break;
    case "percentage":
      formattedValue = `${value}%`;
      formattedChange = `${isPositive ? "+" : ""}${(value - previousValue).toFixed(1)}%`;
      break;
    default:
      formattedValue = formatNumber(value);
      formattedChange = `${isPositive ? "+" : ""}${formatNumber(value - previousValue)}`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
          )}
          <span className={cn(
            "font-medium",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {Math.abs(changePercent).toFixed(1)}%
          </span>
          <span className="ml-1">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/dashboard/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart Section */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue trend for the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-lg">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Chart visualization would go here
                </p>
                <p className="text-xs text-muted-foreground">
                  Integration with Recharts for interactive charts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts to help you get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/new">
              <Card className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <CardContent className="flex items-center space-x-4 p-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Create Dashboard</p>
                    <p className="text-sm text-muted-foreground">Build new analytics dashboard</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/connections">
              <Card className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <CardContent className="flex items-center space-x-4 p-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Plus className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Add Data Source</p>
                    <p className="text-sm text-muted-foreground">Connect new data source</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/queries">
              <Card className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <CardContent className="flex items-center space-x-4 p-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">New Query</p>
                    <p className="text-sm text-muted-foreground">Write custom SQL query</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/team">
              <Card className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <CardContent className="flex items-center space-x-4 p-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Invite Team</p>
                    <p className="text-sm text-muted-foreground">Add team members</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
