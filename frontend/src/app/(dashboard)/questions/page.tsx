"use client";

import React, { useState } from "react";
import { RecentQuestions, Question } from "@/components/questions/recent-questions";
import { QuestionInterface, QuestionMode } from "@/components/questions/question-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  SortDesc,
  MessageSquare,
  BarChart3,
  Database,
  Star,
  Calendar,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

// Extended mock data for questions page
const allQuestions: Question[] = [
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
    status: 'completed',
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
  },
  {
    id: '6',
    text: 'How many new customers signed up this month?',
    mode: 'chat',
    createdAt: '2 days ago',
    panelCount: 2,
    isPinned: false,
    status: 'completed',
    author: 'You',
    tags: ['customers', 'growth']
  },
  {
    id: '7',
    text: 'Average order value by product category',
    mode: 'simple',
    createdAt: '3 days ago',
    panelCount: 3,
    isPinned: true,
    status: 'completed',
    author: 'Emma Wilson',
    tags: ['orders', 'categories']
  },
  {
    id: '8',
    text: 'SELECT DATE_TRUNC(\'month\', created_at) as month, COUNT(*) FROM users GROUP BY month',
    mode: 'sql',
    createdAt: '1 week ago',
    panelCount: 1,
    isPinned: false,
    status: 'completed',
    author: 'Tech Team'
  }
];

const filterOptions = [
  { id: 'all', label: 'All Questions', icon: MessageSquare },
  { id: 'mine', label: 'My Questions', icon: User },
  { id: 'pinned', label: 'Pinned', icon: Star },
  { id: 'chat', label: 'Chat Mode', icon: MessageSquare },
  { id: 'simple', label: 'Simple Mode', icon: BarChart3 },
  { id: 'sql', label: 'SQL Mode', icon: Database },
];

const sortOptions = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'popular', label: 'Most Panels' },
  { id: 'author', label: 'By Author' },
];

export default function QuestionsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewQuestion, setShowNewQuestion] = useState(false);

  const handleQuestionSubmit = async (question: string, mode: QuestionMode) => {
    console.log('New question submitted:', { question, mode });
    setShowNewQuestion(false);
    // In real app: navigate to question results
  };

  const handleQuestionClick = (questionId: string) => {
    console.log('Opening question:', questionId);
    // In real app: navigate to question details
  };

  const handlePinToggle = (questionId: string) => {
    console.log('Toggling pin for question:', questionId);
    // In real app: update question pin status
  };

  // Filter and sort questions
  const filteredQuestions = allQuestions.filter(question => {
    // Search filter
    if (searchQuery && !question.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Mode/type filters
    switch (selectedFilter) {
      case 'mine':
        return question.author === 'You';
      case 'pinned':
        return question.isPinned;
      case 'chat':
      case 'simple':
      case 'sql':
        return question.mode === selectedFilter;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (selectedSort) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.panelCount - a.panelCount;
      case 'author':
        return a.author.localeCompare(b.author);
      default: // recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Questions</h1>
            <p className="text-slate-600 mt-1">
              View and manage all your data questions and analyses
            </p>
          </div>
          <Button 
            onClick={() => setShowNewQuestion(!showNewQuestion)}
            className="shadow-sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask New Question
          </Button>
        </div>

        {/* New Question Interface */}
        {showNewQuestion && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-slate-900">Ask a New Question</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNewQuestion(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </Button>
            </div>
            <QuestionInterface onQuestionSubmit={handleQuestionSubmit} />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFilter === option.id;
                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(option.id)}
                    className={cn(
                      "flex items-center space-x-2 shadow-sm",
                      isSelected && "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
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
            Showing {filteredQuestions.length} of {allQuestions.length} questions
          </span>
          <div className="flex items-center space-x-4">
            <span>{allQuestions.filter(q => q.isPinned).length} pinned</span>
            <span>{allQuestions.filter(q => q.author === 'You').length} by you</span>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <div key={question.id} className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <RecentQuestions
                  questions={[question]}
                  onQuestionClick={handleQuestionClick}
                  onPinToggle={handlePinToggle}
                  className="mb-0 border-0 shadow-none bg-transparent"
                />
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-16">
              <div className="text-center text-slate-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-xl mb-2 text-slate-700">No questions found</p>
                <p className="text-sm mb-6">
                  {searchQuery 
                    ? `No questions match "${searchQuery}"`
                    : selectedFilter !== 'all'
                    ? `No questions in the ${filterOptions.find(f => f.id === selectedFilter)?.label} filter`
                    : "Start by asking your first question"
                  }
                </p>
                {!searchQuery && selectedFilter === 'all' && (
                  <Button 
                    className="shadow-sm"
                    onClick={() => setShowNewQuestion(true)}
                  >
                    Ask Your First Question
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
