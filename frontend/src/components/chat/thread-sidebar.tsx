"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  MessageSquare, 
  MoreHorizontal,
  Trash2,
  Edit2,
  Share,
  Pin,
  Clock,
  Search,
  Database
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Thread {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  dataSource?: {
    id: string;
    name: string;
    type: string;
  };
  isPinned?: boolean;
}

interface ThreadSidebarProps {
  threads: Thread[];
  currentThreadId?: string | null;
  onCreateThread: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  onRenameThread?: (threadId: string, newTitle: string) => void;
  onPinThread?: (threadId: string) => void;
  className?: string;
}

export function ThreadSidebar({
  threads,
  currentThreadId,
  onCreateThread,
  onSelectThread,
  onDeleteThread,
  onRenameThread,
  onPinThread,
  className
}: ThreadSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedThreads = filteredThreads.filter(thread => thread.isPinned);
  const regularThreads = filteredThreads.filter(thread => !thread.isPinned);

  const handleRename = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = () => {
    if (editingThreadId && editingTitle.trim()) {
      onRenameThread?.(editingThreadId, editingTitle.trim());
    }
    setEditingThreadId(null);
    setEditingTitle('');
  };

  const handleCancelRename = () => {
    setEditingThreadId(null);
    setEditingTitle('');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("w-80 bg-white border-r border-slate-200 flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
          <Button onClick={onCreateThread} size="sm" className="shadow-sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Threads */}
        {pinnedThreads.length > 0 && (
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </h3>
            <div className="space-y-2">
              {pinnedThreads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isSelected={currentThreadId === thread.id}
                  isEditing={editingThreadId === thread.id}
                  editingTitle={editingTitle}
                  onSelect={() => onSelectThread(thread.id)}
                  onRename={handleRename}
                  onSaveRename={handleSaveRename}
                  onCancelRename={handleCancelRename}
                  onDelete={onDeleteThread}
                  onPin={onPinThread}
                  onEditingTitleChange={setEditingTitle}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Threads */}
        <div className="p-4">
          {pinnedThreads.length > 0 && (
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Recent
            </h3>
          )}
          <div className="space-y-2">
            {regularThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isSelected={currentThreadId === thread.id}
                isEditing={editingThreadId === thread.id}
                editingTitle={editingTitle}
                onSelect={() => onSelectThread(thread.id)}
                onRename={handleRename}
                onSaveRename={handleSaveRename}
                onCancelRename={handleCancelRename}
                onDelete={onDeleteThread}
                onPin={onPinThread}
                onEditingTitleChange={setEditingTitle}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredThreads.length === 0 && (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">
              {searchQuery ? `No conversations match "${searchQuery}"` : "No conversations yet"}
            </p>
            {!searchQuery && (
              <Button onClick={onCreateThread} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Start a conversation
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ThreadItemProps {
  thread: Thread;
  isSelected: boolean;
  isEditing: boolean;
  editingTitle: string;
  onSelect: () => void;
  onRename: (threadId: string, currentTitle: string) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onDelete?: (threadId: string) => void;
  onPin?: (threadId: string) => void;
  onEditingTitleChange: (title: string) => void;
  formatTimeAgo: (date: Date) => string;
}

function ThreadItem({
  thread,
  isSelected,
  isEditing,
  editingTitle,
  onSelect,
  onRename,
  onSaveRename,
  onCancelRename,
  onDelete,
  onPin,
  onEditingTitleChange,
  formatTimeAgo
}: ThreadItemProps) {
  const [showActions, setShowActions] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveRename();
    } else if (e.key === 'Escape') {
      onCancelRename();
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg p-3 cursor-pointer transition-all duration-200",
        isSelected 
          ? "bg-blue-50 border-2 border-blue-300 shadow-sm" 
          : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={onSaveRename}
              className="w-full text-sm font-medium bg-white border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 className={cn(
              "text-sm font-medium line-clamp-1 mb-1",
              isSelected ? "text-blue-900" : "text-slate-900"
            )}>
              {thread.title}
            </h4>
          )}
          
          <p className={cn(
            "text-xs line-clamp-2 mb-2",
            isSelected ? "text-blue-700" : "text-slate-600"
          )}>
            {thread.preview}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {thread.dataSource && (
                <div className="flex items-center space-x-1">
                  <Database className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{thread.dataSource.name}</span>
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs",
              isSelected ? "text-blue-600" : "text-slate-400"
            )}>
              {formatTimeAgo(thread.updatedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && !isEditing && (
          <div className="flex items-center space-x-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onPin?.(thread.id);
              }}
            >
              <Pin className={cn(
                "h-3 w-3",
                thread.isPinned ? "text-blue-600" : "text-slate-400"
              )} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRename(thread.id, thread.title);
              }}
            >
              <Edit2 className="h-3 w-3 text-slate-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(thread.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
