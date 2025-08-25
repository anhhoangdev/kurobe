"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Sparkles, 
  Database,
  BarChart3,
  Brain,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionInterfaceProps {
  onQuestionSubmit?: (question: string, mode: QuestionMode) => void;
  placeholder?: string;
  className?: string;
}

export type QuestionMode = 'chat' | 'simple' | 'sql';

const questionModes = [
  {
    id: 'chat' as const,
    name: 'Ask in Natural Language',
    description: 'Ask questions like "Show me sales trends this quarter"',
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    examples: [
      "Show me sales trends for the last 6 months",
      "What are our top performing products?",
      "Compare revenue by region this year vs last year"
    ]
  },
  {
    id: 'simple' as const,
    name: 'Simple Question',
    description: 'Build queries with point-and-click interface',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    examples: [
      "Count of orders by month",
      "Sum of revenue by product category",
      "Average customer lifetime value"
    ]
  },
  {
    id: 'sql' as const,
    name: 'Custom SQL',
    description: 'Write your own SQL queries for advanced analysis',
    icon: Database,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    examples: [
      "SELECT * FROM orders WHERE created_at > '2024-01-01'",
      "WITH monthly_revenue AS (...) SELECT ...",
      "SELECT customer_id, COUNT(*) as order_count ..."
    ]
  }
];

export function QuestionInterface({ 
  onQuestionSubmit, 
  placeholder = "Ask a question about your data...",
  className 
}: QuestionInterfaceProps) {
  const [selectedMode, setSelectedMode] = useState<QuestionMode>('chat');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onQuestionSubmit?.(question, selectedMode);
      setQuestion('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
  };

  const selectedModeConfig = questionModes.find(mode => mode.id === selectedMode)!;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Mode Selection Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
        {questionModes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const Icon = mode.icon;
          
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm",
                isSelected 
                  ? "bg-white shadow-sm text-slate-900" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{mode.name.replace(' Question', '').replace('Ask in ', '')}</span>
            </button>
          );
        })}
      </div>

      {/* Main Question Input */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-lg", selectedModeConfig.bgColor)}>
            <selectedModeConfig.icon className={cn("h-5 w-5", selectedModeConfig.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{selectedModeConfig.name}</h3>
            <p className="text-sm text-slate-600">{selectedModeConfig.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[120px] p-6 text-lg border border-slate-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm transition-all duration-200"
            disabled={isLoading}
          />
          
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            {question.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuestion("")}
                disabled={isLoading}
                className="text-slate-500 hover:text-slate-700"
              >
                Clear
              </Button>
            )}
            <Button
              type="submit"
              disabled={!question.trim() || isLoading}
              size="sm"
              className="shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Example Questions for Selected Mode */}
      {selectedModeConfig.examples.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
            Try these examples:
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {selectedModeConfig.examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
                disabled={isLoading}
              >
                <span className={cn(
                  "text-sm",
                  selectedMode === 'sql' ? 'font-mono text-slate-700' : 'text-slate-700'
                )}>
                  {example}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
