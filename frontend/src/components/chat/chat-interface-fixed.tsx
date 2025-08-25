"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  BarChart3,
  Database,
  Bot,
  User,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  panels?: Panel[];
  isTyping?: boolean;
}

export interface Panel {
  id: string;
  type: 'chart' | 'table' | 'metric';
  title: string;
  data: any;
  config: any;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'connected' | 'disconnected' | 'syncing';
}

interface ChatInterfaceProps {
  threadId?: string | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onSelectDataSource: (dataSourceId: string) => void;
  selectedDataSource?: DataSource | null;
  availableDataSources: DataSource[];
  isLoading?: boolean;
  className?: string;
}

export function ChatInterface({
  threadId,
  messages,
  onSendMessage,
  onSelectDataSource,
  selectedDataSource,
  availableDataSources,
  isLoading = false,
  className
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dataSourceDropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dataSourceDropdownRef.current && !dataSourceDropdownRef.current.contains(event.target as Node)) {
        setShowDataSourceDropdown(false);
      }
    };

    if (showDataSourceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDataSourceDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const needsDataSource = !selectedDataSource && messages.length === 0 && threadId;

  return (
    <div className={cn("flex flex-col h-full bg-slate-50 min-h-0", className)}>
      {/* Data Source Selection Bar */}
      {needsDataSource && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Select a data source to start:</span>
              <div className="relative" ref={dataSourceDropdownRef}>
                <button
                  onClick={() => setShowDataSourceDropdown(!showDataSourceDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm">Choose data source</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showDataSourceDropdown && (
                  <div className="absolute top-full mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      {availableDataSources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => {
                            onSelectDataSource(source.id);
                            setShowDataSourceDropdown(false);
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Database className="h-4 w-4 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900">{source.name}</p>
                              <p className="text-sm text-slate-500">{source.description}</p>
                            </div>
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              source.status === 'connected' 
                                ? "bg-green-100 text-green-700"
                                : source.status === 'syncing'
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            )}>
                              {source.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Data Source Bar */}
      {selectedDataSource && (
        <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 p-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Connected to: {selectedDataSource.name}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {selectedDataSource.status}
              </span>
            </div>
            <div className="relative" ref={dataSourceDropdownRef}>
              <button
                onClick={() => setShowDataSourceDropdown(!showDataSourceDropdown)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Change
              </button>
              
              {showDataSourceDropdown && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {availableDataSources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => {
                          onSelectDataSource(source.id);
                          setShowDataSourceDropdown(false);
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Database className="h-4 w-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">{source.name}</p>
                            <p className="text-sm text-slate-500">{source.description}</p>
                          </div>
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            source.status === 'connected' 
                              ? "bg-green-100 text-green-700"
                              : source.status === 'syncing'
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          )}>
                            {source.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-6 min-h-full flex flex-col">
            {!threadId ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Welcome to Kurobe
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Create a new conversation to start analyzing your data with AI.
                  </p>
                </div>
              </div>
            ) : messages.length === 0 && threadId && selectedDataSource ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12 w-full">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Ready to analyze {selectedDataSource.name}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Ask me anything about your data. I can help you create charts, analyze trends, and answer questions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {[
                      "Show me sales trends for the last quarter",
                      "What are our top performing products?",
                      "How many customers did we acquire this month?",
                      "Create a revenue breakdown by region"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(suggestion)}
                        className="text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : threadId && messages.length > 0 ? (
              <div className="flex-1">
                <div className="space-y-6 pb-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={handleCopyMessage}
                    />
                  ))}
                  {isLoading && (
                    <MessageBubble
                      message={{
                        id: 'typing',
                        role: 'assistant',
                        content: '',
                        timestamp: new Date(),
                        isTyping: true
                      }}
                      onCopy={handleCopyMessage}
                    />
                  )}
                </div>
              </div>
            ) : threadId && messages.length === 0 && !selectedDataSource ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Select a Data Source
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Choose a data source from the dropdown above to start your conversation.
                  </p>
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Always at bottom */}
      {threadId && selectedDataSource && (
        <div className="flex-shrink-0 bg-white border-t border-slate-200 p-4 shadow-lg">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your data..."
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 shadow-sm"
                rows={1}
                style={{
                  minHeight: '52px',
                  maxHeight: '120px',
                  height: Math.min(120, Math.max(52, inputValue.split('\n').length * 24 + 28))
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-xl h-9 w-9 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  onCopy: (content: string) => void;
}

function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        "flex gap-3",
        message.role === 'user' ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={cn(
        "max-w-2xl space-y-3",
        message.role === 'user' ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl",
          message.role === 'user'
            ? "bg-blue-600 text-white"
            : "bg-white border border-slate-200 text-slate-900"
        )}>
          {message.isTyping ? (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-slate-500">Thinking...</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Panels */}
        {message.panels && message.panels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {message.panels.map((panel) => (
              <Card key={panel.id} className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900">{panel.title}</h4>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-slate-500">Chart placeholder</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Message Actions */}
        {showActions && !message.isTyping && (
          <div className="flex items-center space-x-1 opacity-0 animate-in fade-in duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(message.content)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}
