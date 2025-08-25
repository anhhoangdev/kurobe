"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  MessageSquare, 
  MoreHorizontal,
  Trash2,
  Pin,
  Share,
  ExternalLink,
  BarChart3,
  User,
  Bot,
  Eye,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface RecentQuestion {
  id: string;
  threadId: string;
  question: string;
  response?: string;
  timestamp: Date;
  author: string;
  panelCount: number;
  isPinned: boolean;
  dataSource: {
    id: string;
    name: string;
    type: string;
  };
  status: 'completed' | 'processing' | 'failed';
}

interface RecentActivityProps {
  questions: RecentQuestion[];
  onOpenQuestion: (questionId: string, threadId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onPinQuestion: (questionId: string) => void;
  onShareQuestion: (questionId: string) => void;
  className?: string;
}

export function RecentActivity({
  questions,
  onOpenQuestion,
  onDeleteQuestion,
  onPinQuestion,
  onShareQuestion,
  className
}: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedQuestions = showAll ? questions : questions.slice(0, 5);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (questions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 text-slate-400 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No recent activity</p>
            <p className="text-slate-400 text-xs mt-1">Start a conversation to see your activity here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 text-slate-400 mr-2" />
            Recent Activity
          </CardTitle>
          {questions.length > 5 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
              className="text-slate-500 hover:text-slate-700"
            >
              {showAll ? 'Show Less' : `View All (${questions.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedQuestions.map((question) => (
          <RecentQuestionItem
            key={question.id}
            question={question}
            onOpen={() => onOpenQuestion(question.id, question.threadId)}
            onDelete={() => onDeleteQuestion(question.id)}
            onPin={() => onPinQuestion(question.id)}
            onShare={() => onShareQuestion(question.id)}
            formatTimeAgo={formatTimeAgo}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface RecentQuestionItemProps {
  question: RecentQuestion;
  onOpen: () => void;
  onDelete: () => void;
  onPin: () => void;
  onShare: () => void;
  formatTimeAgo: (date: Date) => string;
}

function RecentQuestionItem({
  question,
  onOpen,
  onDelete,
  onPin,
  onShare,
  formatTimeAgo
}: RecentQuestionItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
  };

  return (
    <div
      className="group relative p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all duration-200"
      onClick={onOpen}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Status Indicator */}
        <div className="flex-shrink-0 mt-1">
          {question.status === 'processing' ? (
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          ) : question.status === 'failed' ? (
            <div className="w-2 h-2 bg-red-400 rounded-full" />
          ) : (
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Question */}
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-slate-800 line-clamp-2 pr-2">
              {question.question}
            </p>
            {showActions && (
              <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen();
                  }}
                  title="Open conversation"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handlePin}
                  title={question.isPinned ? "Unpin" : "Pin"}
                >
                  <Pin className={cn(
                    "h-3 w-3",
                    question.isPinned ? "text-yellow-600" : "text-slate-400"
                  )} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-red-600"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Response Preview */}
          {question.response && (
            <p className="text-xs text-slate-600 line-clamp-1 mb-2">
              <Bot className="h-3 w-3 inline mr-1" />
              {question.response}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-slate-500">
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {question.author}
              </span>
              <span>{formatTimeAgo(question.timestamp)}</span>
              <span className="flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                {question.panelCount} panel{question.panelCount !== 1 ? 's' : ''}
              </span>
            </div>
            
            <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>

          {/* Data Source */}
          <div className="flex items-center justify-between mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
              {question.dataSource.name}
            </span>
            
            {question.isPinned && (
              <Pin className="h-3 w-3 text-yellow-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Alternative compact view for smaller spaces
export function RecentActivityCompact({
  questions,
  onOpenQuestion,
  onDeleteQuestion,
  limit = 3,
  className
}: {
  questions: RecentQuestion[];
  onOpenQuestion: (questionId: string, threadId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  limit?: number;
  className?: string;
}) {
  const displayedQuestions = questions.slice(0, limit);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-slate-200", className)}>
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Clock className="h-4 w-4 text-slate-400 mr-2" />
            Recent
          </h3>
          <Link href="/questions">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
              View All
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {displayedQuestions.length > 0 ? (
          displayedQuestions.map((question) => (
            <div
              key={question.id}
              className="group cursor-pointer"
              onClick={() => onOpenQuestion(question.id, question.threadId)}
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">
                    {question.question}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">{formatTimeAgo(question.timestamp)}</span>
                    <span className="text-xs text-slate-500">{question.panelCount} panels</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No recent questions</p>
          </div>
        )}
      </div>
    </div>
  );
}
