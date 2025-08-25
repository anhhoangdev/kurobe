"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Pin,
  Share,
  Edit,
  Trash2,
  Calendar,
  User,
  BarChart3,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Dashboard {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  panelCount: number;
  isPublic: boolean;
  isPinned: boolean;
  tags: string[];
  thumbnail?: string;
}

// Mock data for dashboards
const mockDashboards: Dashboard[] = [
  {
    id: '1',
    title: 'Sales Performance Q4 2024',
    description: 'Comprehensive overview of sales metrics, trends, and performance indicators for Q4',
    author: 'You',
    createdAt: '2024-01-15',
    updatedAt: '2 hours ago',
    panelCount: 8,
    isPublic: false,
    isPinned: true,
    tags: ['sales', 'quarterly', 'performance']
  },
  {
    id: '2',
    title: 'Customer Analytics Dashboard',
    description: 'Customer behavior, retention rates, and lifetime value analysis',
    author: 'Sarah Chen',
    createdAt: '2024-01-10',
    updatedAt: '1 day ago',
    panelCount: 12,
    isPublic: true,
    isPinned: false,
    tags: ['customers', 'retention', 'analytics']
  },
  {
    id: '3',
    title: 'Revenue Trends & Forecasting',
    description: 'Monthly and yearly revenue trends with predictive analytics',
    author: 'Mike Johnson',
    createdAt: '2024-01-08',
    updatedAt: '3 days ago',
    panelCount: 6,
    isPublic: true,
    isPinned: true,
    tags: ['revenue', 'forecasting', 'trends']
  },
  {
    id: '4',
    title: 'Product Performance Metrics',
    description: 'Individual product sales, ratings, and market performance',
    author: 'Anna Lee',
    createdAt: '2024-01-05',
    updatedAt: '1 week ago',
    panelCount: 10,
    isPublic: false,
    isPinned: false,
    tags: ['products', 'metrics', 'performance']
  },
  {
    id: '5',
    title: 'Regional Sales Comparison',
    description: 'Geographic breakdown of sales performance across different regions',
    author: 'David Kim',
    createdAt: '2024-01-03',
    updatedAt: '1 week ago',
    panelCount: 7,
    isPublic: true,
    isPinned: false,
    tags: ['regional', 'sales', 'geography']
  }
];

const filterOptions = [
  { id: 'all', label: 'All Dashboards' },
  { id: 'mine', label: 'Created by Me' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
];

export default function DashboardsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePinToggle = (dashboardId: string) => {
    console.log('Toggling pin for dashboard:', dashboardId);
    // In real app: update dashboard pin status
  };

  const handleDashboardClick = (dashboardId: string) => {
    console.log('Opening dashboard:', dashboardId);
    // In real app: navigate to dashboard view
  };

  // Filter dashboards
  const filteredDashboards = mockDashboards.filter(dashboard => {
    // Search filter
    if (searchQuery && !dashboard.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filters
    switch (selectedFilter) {
      case 'mine':
        return dashboard.author === 'You';
      case 'pinned':
        return dashboard.isPinned;
      case 'public':
        return dashboard.isPublic;
      case 'private':
        return !dashboard.isPublic;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboards</h1>
            <p className="text-slate-600 mt-1">
              Manage and organize your data visualization dashboards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/new">
              <Button className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dashboards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const isSelected = selectedFilter === option.id;
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(option.id)}
                    className="shadow-sm"
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-slate-600 mb-6">
          <span>
            Showing {filteredDashboards.length} of {mockDashboards.length} dashboards
          </span>
          <div className="flex items-center space-x-4">
            <span>{mockDashboards.filter(d => d.isPinned).length} pinned</span>
            <span>{mockDashboards.filter(d => d.author === 'You').length} by you</span>
          </div>
        </div>

        {/* Dashboards Grid */}
        {filteredDashboards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map((dashboard) => (
              <Card 
                key={dashboard.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-slate-200 shadow-sm"
                onClick={() => handleDashboardClick(dashboard.id)}
              >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">
                      {dashboard.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {dashboard.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinToggle(dashboard.id);
                      }}
                      className={cn(
                        "h-8 w-8 p-0",
                        dashboard.isPinned && "text-yellow-600 opacity-100"
                      )}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Thumbnail Placeholder */}
                <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">{dashboard.panelCount} panels</p>
                  </div>
                </div>

                {/* Tags */}
                {dashboard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dashboard.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {dashboard.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                        +{dashboard.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {dashboard.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {dashboard.updatedAt}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {dashboard.isPublic && (
                      <Share className="h-3 w-3 text-green-600" />
                    )}
                    {dashboard.isPinned && (
                      <Star className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-16 col-span-full">
            <div className="text-center text-slate-500">
              <LayoutDashboard className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-xl mb-2 text-slate-700">No dashboards found</p>
              <p className="text-sm mb-6">
                {searchQuery 
                  ? `No dashboards match "${searchQuery}"`
                  : selectedFilter !== 'all'
                  ? `No dashboards in the ${filterOptions.find(f => f.id === selectedFilter)?.label} filter`
                  : "Create your first dashboard to get started"
                }
              </p>
              {!searchQuery && selectedFilter === 'all' && (
                <Link href="/dashboard/new">
                  <Button className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
