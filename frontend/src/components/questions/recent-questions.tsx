"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MessageSquare, 
  BarChart3, 
  Database,
  Pin,
  Share,
  MoreHorizontal,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface Question {
  id: string;
  text: string;
  mode: 'chat' | 'simple' | 'sql';
  createdAt: string;
  panelCount: number;
  isPinned: boolean;
  status: 'completed' | 'processing' | 'failed';
  author: string;
  tags?: string[];
}

interface RecentQuestionsProps {
  questions?: Question[];
  onQuestionClick?: (questionId: string) => void;
  onPinToggle?: (questionId: string) => void;
  className?: string;
}

// Mock data - in real app this would come from API
const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Show me sales trends for the last 6 months',
    mode: 'chat',
    createdAt: '2 minutes ago',
    panelCount: 3,
    isPinned: true,
    status: 'completed',
    author: 'You',
    tags: ['sales', 'trends']
  },
  {
    id: '2', 
    text: 'What are our top performing products by revenue?',
    mode: 'chat',
    createdAt: '15 minutes ago',
    panelCount: 2,
    isPinned: false,
    status: 'completed',
    author: 'Sarah Chen',
    tags: ['products', 'revenue']
  },
  {
    id: '3',
    text: 'SELECT customer_id, SUM(order_total) FROM orders WHERE created_at > \'2024-01-01\' GROUP BY customer_id',
    mode: 'sql',
    createdAt: '1 hour ago',
    panelCount: 1,
    isPinned: false,
    status: 'completed',
    author: 'Mike Johnson'
  },
  {
    id: '4',
    text: 'Customer retention rate by signup month',
    mode: 'simple',
    createdAt: '3 hours ago',
    panelCount: 4,
    isPinned: true,
    status: 'processing',
    author: 'Anna Lee',
    tags: ['retention', 'customers']
  },
  {
    id: '5',
    text: 'Regional performance comparison Q3 vs Q4',
    mode: 'chat',
    createdAt: '1 day ago',
    panelCount: 5,
    isPinned: false,
    status: 'completed',
    author: 'David Kim',
    tags: ['regional', 'quarterly']
  }
];

const modeConfig = {
  chat: { icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  simple: { icon: BarChart3, color: 'text-green-600', bgColor: 'bg-green-50' },
  sql: { icon: Database, color: 'text-purple-600', bgColor: 'bg-purple-50' }
};

export function RecentQuestions({ 
  questions = mockQuestions, 
  onQuestionClick,
  onPinToggle,
  className 
}: RecentQuestionsProps) {
  const handleQuestionClick = (questionId: string) => {
    onQuestionClick?.(questionId);
  };

  const handlePinToggle = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    onPinToggle?.(questionId);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-600" />
          Recent Questions
        </CardTitle>
        <Link href="/questions">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((question) => {
          const config = modeConfig[question.mode];
          const Icon = config.icon;
          
          return (
            <div
              key={question.id}
              onClick={() => handleQuestionClick(question.id)}
              className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Question Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={cn("p-1.5 rounded-md", config.bgColor)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">
                          {question.author}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {question.createdAt}
                        </span>
                        {question.status === 'processing' && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-yellow-600 font-medium">
                              Processing...
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className={cn(
                    "text-sm mb-3 line-clamp-2",
                    question.mode === 'sql' ? 'font-mono text-gray-700' : 'text-gray-900'
                  )}>
                    {question.text}
                  </p>

                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Panel Count */}
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {question.panelCount} panel{question.panelCount !== 1 ? 's' : ''} generated
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handlePinToggle(e, question.id)}
                    className={cn(
                      "h-8 w-8 p-0",
                      question.isPinned && "text-yellow-600"
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
                    <Share className="h-4 w-4" />
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
            </div>
          );
        })}

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No questions asked yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start by asking a question about your data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
