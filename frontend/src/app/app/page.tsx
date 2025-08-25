"use client";

import React, { useState, useEffect } from "react";
import { ChatInterface, Message, DataSource } from "@/components/chat/chat-interface";
import { ThreadSidebar, Thread } from "@/components/chat/thread-sidebar";
import { RecentActivityCompact, RecentQuestion } from "@/components/chat/recent-activity";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Button } from "@/components/ui/button";
import { generateMockId } from "@/lib/id-generator";
import { 
  BarChart3, 
  Settings,
  Menu,
  X,
  Database
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock data for data sources (would come from API)
const mockDataSources: DataSource[] = [
  {
    id: 'postgres-prod',
    name: 'Production Database',
    type: 'PostgreSQL',
    description: 'Main production database with customer and order data',
    status: 'connected'
  },
  {
    id: 'analytics-warehouse',
    name: 'Analytics Warehouse', 
    type: 'Trino',
    description: 'Data warehouse with aggregated analytics tables',
    status: 'connected'
  },
  {
    id: 'marketing-data',
    name: 'Marketing Data',
    type: 'DuckDB',
    description: 'Marketing campaign data and customer engagement metrics',
    status: 'syncing'
  }
];

// Mock threads data (would come from API)
const mockThreads: Thread[] = [
  {
    id: '1',
    title: 'Sales Analysis Q4 2024',
    preview: 'Show me sales trends for the last quarter and compare with previous year...',
    createdAt: new Date('2024-12-15T14:00:00Z'),
    updatedAt: new Date('2024-12-15T15:55:00Z'),
    messageCount: 8,
    dataSource: {
      id: 'postgres-prod',
      name: 'Production Database',
      type: 'PostgreSQL'
    },
    isPinned: true
  },
  {
    id: '2',
    title: 'Customer Retention Metrics',
    preview: 'What is our customer retention rate and how can we improve it?',
    createdAt: new Date('2024-12-14T16:00:00Z'),
    updatedAt: new Date('2024-12-15T14:00:00Z'),
    messageCount: 12,
    dataSource: {
      id: 'analytics-warehouse',
      name: 'Analytics Warehouse',
      type: 'Trino'
    }
  },
  {
    id: '3',
    title: 'Product Performance Dashboard',
    preview: 'Create visualizations for top performing products by revenue and units sold',
    createdAt: new Date('2024-12-12T10:00:00Z'),
    updatedAt: new Date('2024-12-15T10:00:00Z'),
    messageCount: 15,
    dataSource: {
      id: 'postgres-prod',
      name: 'Production Database',
      type: 'PostgreSQL'
    },
    isPinned: true
  }
];

// Mock recent questions data (would come from API)
const mockRecentQuestions: RecentQuestion[] = [
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
  }
];

export default function AppPage() {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>(mockThreads);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>(mockRecentQuestions);

  // Load thread data when thread is selected
  useEffect(() => {
    if (currentThreadId) {
      const thread = threads.find(t => t.id === currentThreadId);
      
      if (thread) {
        // Check if this is a new thread (no messages yet)
        if (thread.messageCount === 0) {
          // New thread - start fresh
          setMessages([]);
          setSelectedDataSource(null);
        } else {
          // Existing thread - load mock messages (in real app, fetch from API)
          const mockMessages: Message[] = [
            {
              id: '1',
              role: 'user',
              content: 'Show me sales trends for the last quarter',
              timestamp: new Date('2024-12-15T15:50:00Z')
            },
            {
              id: '2',
              role: 'assistant',
              content: 'I\'ll analyze the sales trends for Q4 2024. Let me create some visualizations for you.',
              timestamp: new Date('2024-12-15T15:51:00Z'),
              panels: [
                {
                  id: 'panel1',
                  type: 'chart',
                  title: 'Quarterly Sales Trend',
                  data: {},
                  config: {}
                }
              ]
            }
          ];
          setMessages(mockMessages);
          
          // Set data source for existing threads
          if (thread.dataSource) {
            const dataSource = mockDataSources.find(ds => ds.id === thread.dataSource?.id);
            setSelectedDataSource(dataSource || null);
          }
        }
      }
    } else {
      // No thread selected - clear everything
      setMessages([]);
      setSelectedDataSource(null);
    }
  }, [currentThreadId, threads]);

  const handleCreateThread = () => {
    const newThread: Thread = {
      id: generateMockId('thread'),
      title: 'New Conversation',
      preview: 'Start a new conversation...',
      createdAt: new Date('2024-12-15T16:00:00Z'),
      updatedAt: new Date('2024-12-15T16:00:00Z'),
      messageCount: 0
    };
    
    console.log('Creating new thread:', newThread.id);
    setThreads([newThread, ...threads]);
    setCurrentThreadId(newThread.id);
    setMessages([]);
    setSelectedDataSource(null);
    console.log('New thread set as current:', newThread.id);
  };

  const handleSelectThread = (threadId: string) => {
    console.log('Selecting thread:', threadId);
    setCurrentThreadId(threadId);
  };

  const handleSelectDataSource = (dataSourceId: string) => {
    const dataSource = mockDataSources.find(ds => ds.id === dataSourceId);
    setSelectedDataSource(dataSource || null);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedDataSource) return;

    // Add user message
    const userMessage: Message = {
      id: generateMockId('msg'),
      role: 'user',
      content,
      timestamp: new Date('2024-12-15T16:00:00Z')
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add assistant response
      const assistantMessage: Message = {
        id: generateMockId('msg'),
        role: 'assistant',
        content: `I've analyzed your question: "${content}". Here are the insights based on ${selectedDataSource.name}.`,
        timestamp: new Date('2024-12-15T16:01:00Z'),
        panels: [
          {
            id: generateMockId('panel'),
            type: 'chart',
            title: 'Generated Chart',
            data: {},
            config: {}
          }
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update thread title and message count if it's the first message
      if (currentThreadId && messages.length === 0) {
        setThreads(prev => prev.map(thread => 
          thread.id === currentThreadId 
            ? { 
                ...thread, 
                title: content.slice(0, 50) + (content.length > 50 ? '...' : ''), 
                preview: content,
                messageCount: 2, // user + assistant message
                updatedAt: new Date('2024-12-15T16:01:00Z')
              }
            : thread
        ));
      } else if (currentThreadId) {
        // Update message count and timestamp for existing threads
        setThreads(prev => prev.map(thread => 
          thread.id === currentThreadId 
            ? { 
                ...thread, 
                messageCount: thread.messageCount + 2, // user + assistant message
                updatedAt: new Date('2024-12-15T16:01:00Z'),
                preview: content
              }
            : thread
        ));
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
      setMessages([]);
      setSelectedDataSource(null);
    }
  };

  const handleRenameThread = (threadId: string, newTitle: string) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId ? { ...thread, title: newTitle } : thread
    ));
  };

  const handlePinThread = (threadId: string) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId ? { ...thread, isPinned: !thread.isPinned } : thread
    ));
  };

  // Recent Questions handlers
  const handleOpenQuestion = (questionId: string, threadId: string) => {
    // Navigate to the thread containing this question
    setCurrentThreadId(threadId);
    
    // Optionally scroll to the specific message in the thread
    console.log('Opening question:', questionId, 'in thread:', threadId);
    
    // In real app, you might also highlight the specific message
    // or scroll to it within the conversation
  };

  const handleDeleteQuestion = (questionId: string) => {
    setRecentQuestions(prev => prev.filter(q => q.id !== questionId));
    
    // In real app, this would also:
    // 1. Delete from backend
    // 2. Remove from thread if it was the only question
    // 3. Update thread title if it was the first question
    console.log('Deleting question:', questionId);
  };

  const handlePinQuestion = (questionId: string) => {
    setRecentQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, isPinned: !q.isPinned } : q
    ));
    
    console.log('Toggling pin for question:', questionId);
  };

  const handleShareQuestion = (questionId: string) => {
    const question = recentQuestions.find(q => q.id === questionId);
    if (question) {
      // Create shareable link
      const shareUrl = `${window.location.origin}/app/thread/${question.threadId}?q=${questionId}`;
      navigator.clipboard.writeText(shareUrl);
      
      // Show toast notification
      console.log('Question shared:', shareUrl);
      
      // In real app, show success toast
      alert('Question link copied to clipboard!');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Thread Sidebar */}
      {showSidebar && (
        <ThreadSidebar
          threads={threads}
          currentThreadId={currentThreadId}
          onCreateThread={handleCreateThread}
          onSelectThread={handleSelectThread}
          onDeleteThread={handleDeleteThread}
          onRenameThread={handleRenameThread}
          onPinThread={handlePinThread}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden"
                >
                  {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Kurobe</h1>
                    <p className="text-sm text-slate-500">AI Data Assistant</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link href="/dashboards">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboards
                  </Button>
                </Link>
                <Link href="/app/data">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    Browse Data
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Interface with Sidebar */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0">
            <ChatInterface
              threadId={currentThreadId}
              messages={messages}
              onSendMessage={handleSendMessage}
              onSelectDataSource={handleSelectDataSource}
              selectedDataSource={selectedDataSource}
              availableDataSources={mockDataSources}
              isLoading={isLoading}
            />
          </div>
          
          {/* Right Sidebar */}
          <ChatSidebar
            recentQuestions={recentQuestions}
            onOpenQuestion={handleOpenQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            className="hidden lg:block flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
