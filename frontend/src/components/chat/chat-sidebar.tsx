"use client";

import React from "react";
import { RecentActivityCompact, RecentQuestion } from "./recent-activity";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Database,
  TrendingUp,
  Users,
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  recentQuestions: RecentQuestion[];
  onOpenQuestion: (questionId: string, threadId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  className?: string;
}

// Quick actions for the sidebar
const quickActions = [
  {
    title: "Browse Data",
    description: "Explore your data sources",
    icon: Database,
    href: "/app/data",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "My Dashboards",
    description: "View saved dashboards",
    icon: BarChart3,
    href: "/dashboards",
    color: "text-green-600", 
    bgColor: "bg-green-50"
  },
  {
    title: "Analytics",
    description: "Usage and insights",
    icon: TrendingUp,
    href: "/analytics",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }
];

export function ChatSidebar({
  recentQuestions,
  onOpenQuestion,
  onDeleteQuestion,
  className
}: ChatSidebarProps) {
  return (
    <div className={cn("w-80 bg-white border-l border-slate-200 p-6 space-y-6 overflow-y-auto h-full", className)}>
      {/* Recent Activity */}
      <RecentActivityCompact
        questions={recentQuestions}
        onOpenQuestion={onOpenQuestion}
        onDeleteQuestion={onDeleteQuestion}
        limit={5}
      />

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Questions this week</span>
            <span className="text-lg font-semibold text-slate-900">
              {recentQuestions.filter(q => {
                const weekAgo = new Date('2024-12-08T16:00:00Z'); // Static date for SSR consistency
                return q.timestamp > weekAgo;
              }).length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Pinned questions</span>
            <span className="text-lg font-semibold text-slate-900">
              {recentQuestions.filter(q => q.isPinned).length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Data sources</span>
            <span className="text-lg font-semibold text-slate-900">3</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group cursor-pointer">
                  <div className={cn("p-2 rounded-lg group-hover:scale-105 transition-transform", action.bgColor)}>
                    <Icon className={cn("h-4 w-4", action.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800">{action.title}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-center mb-3">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-slate-900">Need Help?</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Learn how to ask better questions and get more insights from your data.
        </p>
        <div className="space-y-2">
          <Link href="/help">
            <Button size="sm" variant="outline" className="w-full">
              View Documentation
            </Button>
          </Link>
          <Link href="/examples">
            <Button size="sm" variant="outline" className="w-full">
              Example Questions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
