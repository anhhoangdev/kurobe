"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, CheckCircle, XCircle, MoreVertical } from "lucide-react";

// Mock data - replace with actual API calls
const mockQuestions = [
  {
    id: "1",
    text: "What are the top 10 products by revenue in Q4 2024?",
    status: "completed",
    panelCount: 2,
    createdAt: "2024-01-15T10:30:00Z",
    tags: ["revenue", "products", "quarterly"],
  },
  {
    id: "2", 
    text: "Show me user growth trends over the last 6 months",
    status: "processing",
    panelCount: 0,
    createdAt: "2024-01-15T09:15:00Z",
    tags: ["users", "growth", "trends"],
  },
  {
    id: "3",
    text: "Compare sales performance across different regions",
    status: "failed",
    panelCount: 0,
    createdAt: "2024-01-14T16:45:00Z",
    tags: ["sales", "regions", "comparison"],
    error: "Unable to connect to data source",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants = {
    completed: "default",
    processing: "secondary", 
    failed: "destructive",
    pending: "outline",
  } as const;
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
      {status}
    </Badge>
  );
};

export function QuestionsList() {
  if (mockQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No questions yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by asking your first question about your data
        </p>
        <Button>Ask a Question</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {mockQuestions.map((question) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(question.status)}
                  {getStatusBadge(question.status)}
                  {question.panelCount > 0 && (
                    <Badge variant="outline">
                      {question.panelCount} panel{question.panelCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mb-1">{question.text}</CardTitle>
                <CardDescription>
                  Asked {new Date(question.createdAt).toLocaleDateString()}
                  {question.error && (
                    <span className="text-red-500 block mt-1">
                      Error: {question.error}
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {question.tags.length > 0 && (
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
