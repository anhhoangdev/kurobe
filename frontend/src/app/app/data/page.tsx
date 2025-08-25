"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database,
  Search,
  Filter,
  Table,
  BarChart3,
  Plus,
  Settings,
  ChevronRight,
  FileText,
  Hash,
  Calendar,
  Type,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock data for data sources and tables (like Metabase)
const dataSources = [
  {
    id: 'postgres-prod',
    name: 'Production Database',
    type: 'PostgreSQL',
    description: 'Main production database with customer and order data',
    status: 'connected',
    tables: [
      {
        name: 'customers',
        displayName: 'Customers',
        description: 'Customer information and profiles',
        rows: 15234,
        columns: 12,
        type: 'table',
        schema: 'public'
      },
      {
        name: 'orders',
        displayName: 'Orders', 
        description: 'Customer orders and transaction data',
        rows: 89456,
        columns: 8,
        type: 'table',
        schema: 'public'
      },
      {
        name: 'products',
        displayName: 'Products',
        description: 'Product catalog and inventory',
        rows: 2341,
        columns: 15,
        type: 'table',
        schema: 'public'
      },
      {
        name: 'order_items',
        displayName: 'Order Items',
        description: 'Individual items within orders',
        rows: 234567,
        columns: 6,
        type: 'table',
        schema: 'public'
      }
    ]
  },
  {
    id: 'analytics-warehouse',
    name: 'Analytics Warehouse',
    type: 'Trino',
    description: 'Data warehouse with aggregated analytics tables',
    status: 'connected',
    tables: [
      {
        name: 'daily_sales_summary',
        displayName: 'Daily Sales Summary',
        description: 'Aggregated daily sales metrics',
        rows: 1234,
        columns: 10,
        type: 'view',
        schema: 'analytics'
      },
      {
        name: 'customer_metrics',
        displayName: 'Customer Metrics',
        description: 'Customer lifetime value and behavior metrics',
        rows: 15234,
        columns: 25,
        type: 'view',
        schema: 'analytics'
      }
    ]
  }
];

const columnTypeIcons = {
  string: Type,
  number: Hash,
  date: Calendar,
  boolean: FileText
};

export default function DataBrowserPage() {
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedSource = dataSources.find(ds => ds.id === selectedDataSource);
  const filteredTables = selectedSource?.tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAskQuestion = (table: string) => {
    // Navigate to question interface with pre-selected table
    console.log('Ask question about table:', table);
    // In real app: router.push(`/app?table=${table}&dataSource=${selectedDataSource}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Browse Data</h1>
                <p className="text-sm text-slate-500">Explore your data sources and tables</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/app">
                <Button variant="outline" className="shadow-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ask Questions
                </Button>
              </Link>
              <Link href="/app/connections/new">
                <Button className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Data Source
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Data Sources Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Sources</h3>
              <div className="space-y-3">
                {dataSources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedDataSource(source.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-200",
                      selectedDataSource === source.id
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Database className={cn(
                        "h-4 w-4",
                        selectedDataSource === source.id ? "text-blue-600" : "text-slate-600"
                      )} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm">{source.name}</h4>
                        <p className="text-xs text-slate-500">{source.type}</p>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4",
                        selectedDataSource === source.id ? "text-blue-600" : "text-slate-400"
                      )} />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <Link href="/app/connections/new">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Data Source
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedSource ? (
              <div className="space-y-6">
                {/* Data Source Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedSource.name}</h2>
                      <p className="text-slate-600 mt-1">{selectedSource.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {selectedSource.status}
                        </span>
                        <span className="text-sm text-slate-500">
                          {selectedSource.tables.length} tables
                        </span>
                        <span className="text-sm text-slate-500">
                          {selectedSource.type}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search tables..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTables.map((table) => (
                    <Card key={table.name} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-slate-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                              <Table className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{table.displayName}</CardTitle>
                              <p className="text-sm text-slate-500">{table.schema}.{table.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleAskQuestion(table.name)}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm text-slate-600 mb-4">{table.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                          <span>{table.rows.toLocaleString()} rows</span>
                          <span>{table.columns} columns</span>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            table.type === 'table' 
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          )}>
                            {table.type}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAskQuestion(table.name)}
                            className="flex-1 mr-2"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Ask Question
                          </Button>
                          <Button size="sm" variant="ghost">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTables.length === 0 && searchQuery && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-16">
                    <div className="text-center text-slate-500">
                      <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-lg mb-2">No tables found</p>
                      <p className="text-sm">No tables match "{searchQuery}"</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-16">
                <div className="text-center text-slate-500">
                  <Database className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Data Source</h3>
                  <p className="text-sm mb-6">Choose a data source from the sidebar to explore its tables and start asking questions.</p>
                  <Link href="/app/connections/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Data Source
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
