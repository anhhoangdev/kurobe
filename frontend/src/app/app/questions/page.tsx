"use client";

import React, { useState } from "react";
import { RecentActivity, RecentQuestion } from "@/components/chat/recent-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Plus,
  Filter,
  Search,
  SortDesc,
  BarChart3,
  Settings
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Extended mock data for all questions
const allRecentQuestions: RecentQuestion[] = [
  {
    id: 'q1',
    threadId: '1',
    question: 'Show me sales trends for the last 6 months',
    response: 'I\'ll analyze the sales trends for Q4 2024. Here are the key insights...',
    timestamp: new Date('2024-12-15T15:58:00Z'),
    author: 'You',
    panelCount: 3,
    isPinned: false,
    dataSource: { id: 'postgres-prod', name: 'Production Database', type: 'PostgreSQL' },
    status: 'completed'
  },
  {
    id: 'q2',
    threadId: '2',
    question: 'What are our top performing products by revenue?',
    response: 'Based on the revenue data, here are your top performing products...',
    timestamp: new Date('2024-12-15T15:45:00Z'),
    author: 'Sarah Chen',
    panelCount: 2,
    isPinned: true,
    dataSource: { id: 'analytics-warehouse', name: 'Analytics Warehouse', type: 'Trino' },
    status: 'completed'
  },
  {
    id: 'q3',
    threadId: '3',
    question: 'Customer retention rate by signup month',
    response: 'The customer retention analysis shows interesting patterns...',
    timestamp: new Date('2024-12-15T15:00:00Z'),
    author: 'Mike Johnson',
    panelCount: 4,
    isPinned: false,
    dataSource: { id: 'postgres-prod', name: 'Production Database', type: 'PostgreSQL' },
    status: 'completed'
  },
  {
    id: 'q4',
    threadId: '1',
    question: 'How does our quarterly performance compare to last year?',
    timestamp: new Date('2024-12-15T14:00:00Z'),
    author: 'Anna Lee',
    panelCount: 2,
    isPinned: false,
    dataSource: { id: 'analytics-warehouse', name: 'Analytics Warehouse', type: 'Trino' },
    status: 'processing'
  },
  {
    id: 'q5',
    threadId: '2',
    question: 'Regional sales breakdown for this quarter',
    response: 'Here\'s the regional analysis you requested...',
    timestamp: new Date('2024-12-15T13:00:00Z'),
    author: 'David Kim',
    panelCount: 5,
    isPinned: true,
    dataSource: { id: 'postgres-prod', name: 'Production Database', type: 'PostgreSQL' },
    status: 'completed'
  },
  {
    id: 'q6',
    threadId: '4',
    question: 'What is the average order value by customer segment?',
    response: 'The segmentation analysis reveals distinct patterns in order values...',
    timestamp: new Date('2024-12-14T16:00:00Z'),
    author: 'You',
    panelCount: 3,
    isPinned: false,
    dataSource: { id: 'postgres-prod', name: 'Production Database', type: 'PostgreSQL' },
    status: 'completed'
  },
  {
    id: 'q7',
    threadId: '5',
    question: 'Show me the conversion funnel from last month',
    response: 'Here\'s your conversion funnel analysis with key drop-off points...',
    timestamp: new Date('2024-12-13T16:00:00Z'),
    author: 'Emma Wilson',
    panelCount: 6,
    isPinned: true,
    dataSource: { id: 'analytics-warehouse', name: 'Analytics Warehouse', type: 'Trino' },
    status: 'completed'
  }
];

const filterOptions = [
  { id: 'all', label: 'All Questions' },
  { id: 'mine', label: 'My Questions' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'completed', label: 'Completed' },
  { id: 'processing', label: 'Processing' },
];

const sortOptions = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'panels', label: 'Most Panels' },
  { id: 'author', label: 'By Author' },
];

export default function AllQuestionsPage() {
  const [questions, setQuestions] = useState<RecentQuestion[]>(allRecentQuestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');

  const handleOpenQuestion = (questionId: string, threadId: string) => {
    // Navigate to the main app with the specific thread
    window.location.href = `/app?thread=${threadId}&highlight=${questionId}`;
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handlePinQuestion = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, isPinned: !q.isPinned } : q
    ));
  };

  const handleShareQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const shareUrl = `${window.location.origin}/app?thread=${question.threadId}&highlight=${questionId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Question link copied to clipboard!');
    }
  };

  // Filter and sort questions
  const filteredQuestions = questions.filter(question => {
    // Search filter
    if (searchQuery && !question.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !question.response?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status/type filters
    switch (selectedFilter) {
      case 'mine':
        return question.author === 'You';
      case 'pinned':
        return question.isPinned;
      case 'completed':
        return question.status === 'completed';
      case 'processing':
        return question.status === 'processing';
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (selectedSort) {
      case 'oldest':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'panels':
        return b.panelCount - a.panelCount;
      case 'author':
        return a.author.localeCompare(b.author);
      default: // recent
        return b.timestamp.getTime() - a.timestamp.getTime();
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Questions</h1>
                <p className="text-sm text-slate-500">Manage your data questions and analysis history</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/app">
                <Button variant="outline" className="shadow-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </Link>
              <Link href="/dashboards">
                <Button variant="outline" className="shadow-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboards
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions and responses..."
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

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <SortDesc className="h-4 w-4 text-slate-500" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-slate-600 mb-6">
          <span>
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
          <div className="flex items-center space-x-4">
            <span>{questions.filter(q => q.isPinned).length} pinned</span>
            <span>{questions.filter(q => q.author === 'You').length} by you</span>
            <span>{questions.filter(q => q.status === 'processing').length} processing</span>
          </div>
        </div>

        {/* Questions List */}
        <RecentActivity
          questions={filteredQuestions}
          onOpenQuestion={handleOpenQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onPinQuestion={handlePinQuestion}
          onShareQuestion={handleShareQuestion}
        />
      </div>
    </div>
  );
}
