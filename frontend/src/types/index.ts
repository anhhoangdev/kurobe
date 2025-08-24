// Base types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: string;
  memberCount: number;
}

// Dashboard types
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  layout: DashboardLayout;
  widgets: Widget[];
  tags: string[];
}

export interface DashboardLayout {
  columns: number;
  gap: number;
  padding: number;
}

export interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  dataSource?: DataSource;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  metric?: {
    value: number;
    previousValue?: number;
    format: 'number' | 'currency' | 'percentage';
    trend?: 'up' | 'down' | 'neutral';
  };
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

// Data types
export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file';
  connection: ConnectionConfig;
  schema?: TableSchema[];
}

export interface ConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  endpoint?: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  nullable: boolean;
  primaryKey?: boolean;
}

// Query types
export interface Query {
  id: string;
  name: string;
  sql: string;
  dataSourceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  parameters: QueryParameter[];
}

export interface QueryParameter {
  name: string;
  type: 'string' | 'number' | 'date';
  defaultValue?: any;
  required: boolean;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  totalRows: number;
  executionTime: number;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  description?: string;
  formula: string;
  format: 'number' | 'currency' | 'percentage';
  category: string;
}

// API types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: { label: string; value: string }[];
}

// UI types
export type Theme = 'light' | 'dark' | 'system';

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface FilterState {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}
