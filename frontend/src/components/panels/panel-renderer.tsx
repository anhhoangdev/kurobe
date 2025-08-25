"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Table,
  TrendingUp,
  Pin,
  Share,
  Download,
  MoreHorizontal,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PanelSpec {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'table' | 'metric' | 'scatter';
  title: string;
  description?: string;
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    color?: string;
    format?: string;
    [key: string]: any;
  };
  metadata: {
    questionId?: string;
    createdAt: string;
    author: string;
    isPinned?: boolean;
  };
}

interface PanelRendererProps {
  panel: PanelSpec;
  onPin?: (panelId: string) => void;
  onShare?: (panelId: string) => void;
  onDownload?: (panelId: string) => void;
  onExpand?: (panelId: string) => void;
  className?: string;
  showActions?: boolean;
}

const chartIcons = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  table: Table,
  metric: TrendingUp,
  scatter: BarChart3
};

export function PanelRenderer({ 
  panel, 
  onPin,
  onShare,
  onDownload,
  onExpand,
  className,
  showActions = true
}: PanelRendererProps) {
  const ChartIcon = chartIcons[panel.type] || BarChart3;

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.(panel.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(panel.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(panel.id);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand?.(panel.id);
  };

  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <ChartIcon className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-lg line-clamp-1">
                {panel.title}
              </CardTitle>
            </div>
            {panel.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {panel.description}
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePin}
                className={cn(
                  "h-8 w-8 p-0",
                  panel.metadata.isPinned && "text-yellow-600 opacity-100"
                )}
                title="Pin panel"
              >
                <Pin className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 w-8 p-0"
                title="Share panel"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download panel"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="h-8 w-8 p-0"
                title="Expand panel"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart/Visualization Area */}
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center space-y-2">
            <ChartIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-sm font-medium text-gray-600">
              {panel.type.charAt(0).toUpperCase() + panel.type.slice(1)} Chart
            </p>
            <p className="text-xs text-gray-500">
              {panel.data.length} data points
            </p>
            <p className="text-xs text-gray-400">
              Chart rendering will be implemented with Recharts
            </p>
          </div>
        </div>

        {/* Panel Metadata */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>by {panel.metadata.author}</span>
            <span>•</span>
            <span>{panel.metadata.createdAt}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              panel.type === 'line' && "bg-blue-100 text-blue-700",
              panel.type === 'bar' && "bg-green-100 text-green-700",
              panel.type === 'pie' && "bg-purple-100 text-purple-700",
              panel.type === 'table' && "bg-gray-100 text-gray-700",
              panel.type === 'metric' && "bg-orange-100 text-orange-700",
              panel.type === 'scatter' && "bg-pink-100 text-pink-700"
            )}>
              {panel.type}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Panel Grid Component for organizing multiple panels
interface PanelGridProps {
  panels: PanelSpec[];
  onPanelPin?: (panelId: string) => void;
  onPanelShare?: (panelId: string) => void;
  onPanelDownload?: (panelId: string) => void;
  onPanelExpand?: (panelId: string) => void;
  className?: string;
}

export function PanelGrid({ 
  panels, 
  onPanelPin,
  onPanelShare,
  onPanelDownload,
  onPanelExpand,
  className 
}: PanelGridProps) {
  if (panels.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No panels generated yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Ask a question to generate visualization panels
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {panels.map((panel) => (
        <PanelRenderer
          key={panel.id}
          panel={panel}
          onPin={onPanelPin}
          onShare={onPanelShare}
          onDownload={onPanelDownload}
          onExpand={onPanelExpand}
        />
      ))}
    </div>
  );
}
