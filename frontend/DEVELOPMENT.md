# Development Guide

This guide covers the development patterns, conventions, and best practices for the Kurobe platform.

## 🏗️ Architecture Overview

### Component Architecture
- **Atomic Design**: Components are organized in a hierarchical structure
- **Composition over Inheritance**: Use component composition for flexibility
- **Single Responsibility**: Each component has a single, well-defined purpose

### State Management Strategy
- **Server State**: React Query for API data and caching
- **Local State**: React hooks (useState, useReducer)
- **Form State**: React Hook Form with Zod validation
- **URL State**: Next.js router for navigation state

### Data Flow
```
UI Components → Hooks → API Layer → Backend
     ↑                                  ↓
     └── React Query Cache ←── Response
```

## 🛠️ Development Patterns

### Component Patterns

#### 1. **Feature Components**
```typescript
// components/dashboard/dashboard-content.tsx
export function DashboardContent() {
  // Feature-specific logic and UI
}
```

#### 2. **Layout Components**
```typescript
// components/dashboard/layout-content.tsx
export function DashboardLayoutContent({ children }: PropsWithChildren) {
  // Layout logic (navigation, sidebars, etc.)
}
```

#### 3. **UI Components**
```typescript
// components/ui/button.tsx - shadcn/ui pattern
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}
```

### Hook Patterns

#### 1. **Data Fetching Hooks**
```typescript
// hooks/use-dashboards.ts
export function useDashboards() {
  return useQuery({
    queryKey: ["dashboards"],
    queryFn: () => api.getDashboards(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### 2. **Form Hooks**
```typescript
// hooks/use-dashboard-form.ts
export function useDashboardForm() {
  return useForm<DashboardFormData>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
}
```

#### 3. **Custom Business Logic Hooks**
```typescript
// hooks/use-dashboard-actions.ts
export function useDashboardActions() {
  const queryClient = useQueryClient();
  
  return {
    createDashboard: useMutation({
      mutationFn: api.createDashboard,
      onSuccess: () => queryClient.invalidateQueries(["dashboards"]),
    }),
  };
}
```

## 📁 File Organization

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Route groups
│   │   ├── dashboard/      # Dashboard routes
│   │   └── layout.tsx      # Layout for dashboard group
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── dashboard/          # Feature-specific components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   └── sidebar/            # Navigation components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
│   ├── api/                # API client and utilities
│   ├── utils.ts            # General utilities
│   └── config.ts           # App configuration
├── providers/              # React context providers
├── types/                  # TypeScript type definitions
└── middleware.ts           # Next.js middleware
```

### Naming Conventions

#### Files and Directories
- **kebab-case** for files and directories: `dashboard-content.tsx`
- **PascalCase** for components: `DashboardContent`
- **camelCase** for functions and variables: `getDashboards`
- **SCREAMING_SNAKE_CASE** for constants: `MAX_FILE_SIZE`

#### Components
```typescript
// ✅ Good
export function DashboardContent() {}
export const MetricCard = () => {}

// ❌ Avoid
export function dashboardContent() {}
export const metriccard = () => {}
```

#### Hooks
```typescript
// ✅ Good
export function useDashboards() {}
export function useMetricData() {}

// ❌ Avoid
export function getDashboards() {} // Not a hook
export function usedashboards() {} // Wrong casing
```

## 🎨 Styling Guidelines

### Tailwind CSS Patterns

#### 1. **Component Variants**
```typescript
const cardVariants = cva("rounded-lg border bg-card", {
  variants: {
    size: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    variant: {
      default: "border-border",
      elevated: "border-border shadow-lg",
    },
  },
});
```

#### 2. **Responsive Design**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
</div>
```

#### 3. **Dark Mode Support**
```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Automatic dark mode support */}
</div>
```

## 🔧 TypeScript Patterns

### Type Definition Patterns

#### 1. **Interface over Type**
```typescript
// ✅ Preferred for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good for unions and utilities
type Theme = "light" | "dark" | "system";
type UserWithoutId = Omit<User, "id">;
```

#### 2. **Generic Constraints**
```typescript
interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // Implementation
}
```

#### 3. **Strict Props**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
}

// Use React.ComponentProps for HTML element props
interface CustomInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}
```

## 🧪 Testing Patterns

### Component Testing
```typescript
// __tests__/dashboard-content.test.tsx
import { render, screen } from "@testing-library/react";
import { DashboardContent } from "../dashboard-content";

describe("DashboardContent", () => {
  it("renders dashboard metrics", () => {
    render(<DashboardContent />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
// __tests__/use-dashboards.test.ts
import { renderHook } from "@testing-library/react";
import { useDashboards } from "../use-dashboards";

describe("useDashboards", () => {
  it("fetches dashboards data", async () => {
    const { result } = renderHook(() => useDashboards());
    expect(result.current.isLoading).toBe(true);
  });
});
```

## 🚀 Performance Best Practices

### 1. **Code Splitting**
```typescript
// Lazy load heavy components
const ChartComponent = lazy(() => import("./chart-component"));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartComponent />
    </Suspense>
  );
}
```

### 2. **Memoization**
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return processLargeDataset(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  onItemClick(item.id);
}, [onItemClick, item.id]);
```

### 3. **Image Optimization**
```typescript
import Image from "next/image";

<Image
  src="/dashboard-preview.png"
  alt="Dashboard preview"
  width={800}
  height={600}
  priority // For above-the-fold images
/>
```

## 🔒 Security Guidelines

### 1. **Input Validation**
```typescript
// Always validate user input
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const result = schema.safeParse(userInput);
if (!result.success) {
  // Handle validation errors
}
```

### 2. **XSS Prevention**
```typescript
// ✅ Safe - React automatically escapes
<div>{userInput}</div>

// ⚠️ Dangerous - only use with trusted content
<div dangerouslySetInnerHTML={{ __html: trustedHtml }} />
```

### 3. **Environment Variables**
```typescript
// ✅ Public variables (exposed to browser)
NEXT_PUBLIC_API_URL=https://api.example.com

// ✅ Private variables (server-only)
DATABASE_URL=postgresql://...
```

## 📊 Monitoring and Analytics

### Error Boundaries
```typescript
export function ErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        // Log to monitoring service
        console.error("Component error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}
```

### Performance Monitoring
```typescript
// Monitor component render performance
useEffect(() => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    console.log(`Component rendered in ${end - start}ms`);
  };
}, []);
```

## 🔄 Development Workflow

### 1. **Feature Development**
1. Create feature branch: `git checkout -b feature/dashboard-filters`
2. Implement feature with tests
3. Run quality checks: `npm run lint && npm run typecheck`
4. Create pull request with description

### 2. **Code Review Checklist**
- [ ] TypeScript types are properly defined
- [ ] Components are accessible (ARIA labels, keyboard navigation)
- [ ] Error states are handled
- [ ] Loading states are implemented
- [ ] Tests cover main functionality
- [ ] Performance considerations addressed

### 3. **Deployment Process**
1. Merge to main branch
2. Automated tests run
3. Build and deploy to staging
4. Manual testing
5. Deploy to production

## 🐛 Debugging Tips

### React DevTools
```typescript
// Add display names for better debugging
DashboardContent.displayName = "DashboardContent";

// Use React DevTools Profiler
const ProfiledComponent = React.memo(YourComponent);
```

### Console Debugging
```typescript
// Conditional logging
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}

// Error logging with context
catch (error) {
  console.error("API call failed:", {
    error,
    url,
    params,
    timestamp: new Date().toISOString(),
  });
}
```

## 📚 Additional Resources

- [React Best Practices](https://react.dev/learn)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs)

---

Happy coding! 🚀
