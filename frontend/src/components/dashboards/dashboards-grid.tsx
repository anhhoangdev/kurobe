"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, MoreVertical, Eye } from "lucide-react";

// Mock data - replace with actual API calls
const mockDashboards = [
  {
    id: "1",
    name: "Q4 2024 Sales Analysis",
    description: "Revenue trends and product performance analysis",
    panelCount: 5,
    lastUpdated: "2024-01-15T10:30:00Z",
    tags: ["sales", "revenue", "quarterly"],
    isPublic: false,
  },
  {
    id: "2",
    name: "User Growth Metrics",
    description: "User acquisition and retention dashboard",
    panelCount: 3,
    lastUpdated: "2024-01-14T16:45:00Z",
    tags: ["users", "growth", "metrics"],
    isPublic: true,
  },
];

export function DashboardsGrid() {
  if (mockDashboards.length === 0) {
    return (
      <div className="text-center py-12">
        <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No dashboards yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first dashboard by pinning panels from questions
        </p>
        <Button>Create Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockDashboards.map((dashboard) => (
        <Card key={dashboard.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <Badge variant="outline">
                    {dashboard.panelCount} panel{dashboard.panelCount !== 1 ? "s" : ""}
                  </Badge>
                  {dashboard.isPublic && (
                    <Badge variant="secondary">
                      <Eye className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mb-1">{dashboard.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {dashboard.description}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Updated {new Date(dashboard.lastUpdated).toLocaleDateString()}
              </div>
              
              {dashboard.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dashboard.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  View Dashboard
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
