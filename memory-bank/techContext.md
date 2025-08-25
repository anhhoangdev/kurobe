# Technology Context & Stack

## Technology Overview

Kurobe is built with a modern, type-safe stack designed for enterprise BI workloads with emphasis on configuration flexibility and pluggable architecture.

## Backend Stack

### Core Framework
- **Python 3.11+**: Latest language features and performance improvements
- **FastAPI 0.115+**: Modern async API framework with automatic OpenAPI docs
- **Uvicorn**: ASGI server with performance optimizations
- **Pydantic 2.0+**: Data validation and serialization with comprehensive type support

### Database & Storage
- **PostgreSQL 15+**: Primary database with Row Level Security (RLS)
- **SQLAlchemy 2.0+**: Modern async ORM with type safety
- **Asyncpg**: High-performance PostgreSQL driver
- **Alembic**: Database migration management
- **Redis 6+**: Caching, session storage, and job queues

### AI & LLM Integration
- **LiteLLM 1.72+**: Unified interface for multiple LLM providers
  - Anthropic Claude
  - OpenAI GPT models
  - Local model support
- **Langfuse 2.0+**: LLM call tracing and observability
- **Tenacity**: Retry logic for external API calls

### Background Processing
- **Dramatiq 1.18+**: Redis-backed task queue
- **APScheduler 3.10+**: Cron-like job scheduling
- **Redis**: Message broker for distributed tasks

### Security & Auth
- **PyJWT**: JWT token validation (Supabase compatible)
- **Passlib with bcrypt**: Password hashing
- **Cryptography**: Symmetric encryption for sensitive data
- **Python-JOSE**: Additional JWT utilities

### Observability
- **Structlog**: Structured logging with context
- **Sentry SDK**: Error tracking and performance monitoring
- **Prometheus Client**: Metrics collection
- **Python-dotenv**: Environment configuration

### Development Tools
- **Pytest**: Testing framework with async support
- **Black**: Code formatting
- **Ruff**: Fast Python linter
- **MyPy**: Static type checking
- **Pre-commit**: Git hooks for code quality

## Frontend Stack

### Core Framework
- **Next.js 15+**: React framework with App Router
- **React 18+**: UI library with concurrent features
- **TypeScript 5+**: Static typing for JavaScript
- **Node.js 20+**: Runtime environment

### UI & Styling
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Modern icon library
- **Framer Motion**: Animation library
- **Next Themes**: Dark/light mode support

### Data Management
- **@tanstack/react-query 5.85+**: Server state management
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation
- **@tanstack/react-table**: Table components

### Data Visualization
- **Recharts 2.12+**: React charting library built on D3
- **Class Variance Authority**: Component variant management
- **CLSX & Tailwind Merge**: Conditional styling utilities

### Development Tools
- **ESLint 9+**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## SDK Stack

### Core SDK
- **Python 3.11+**: Consistent with backend
- **Pydantic**: Data models and validation
- **HTTPX**: Modern async HTTP client
- **Typing**: Comprehensive type hints

### Legacy Support (Kortix Integration)
- **Existing Kortix patterns**: Maintained for compatibility
- **Agent framework**: Extended for BI use cases
- **Tool system**: Adapted for data operations

## Database Technologies

### Primary Database
- **PostgreSQL 15+**: 
  - Row Level Security (RLS) for multi-tenancy
  - JSONB for flexible configuration storage
  - UUID primary keys throughout
  - Comprehensive indexing strategy
  - Audit logging with triggers

### Multi-Database Support
- **Trino/Presto**: Distributed SQL query engine
- **DuckDB**: In-process analytical database
- **Connection pooling**: Unified interface across database types
- **Health monitoring**: Automatic connection health checks

### Caching Strategy
- **Redis**: 
  - Query result caching (with TTL)
  - Session storage
  - Rate limiting
  - Job queue backend

## Infrastructure & DevOps

### Containerization
- **Docker**: Development environment
- **Docker Compose**: Local infrastructure orchestration
- **Multi-stage builds**: Optimized production images

### Configuration Management
- **Environment variables**: Runtime configuration
- **YAML files**: Engine configuration
- **Pydantic Settings**: Type-safe config validation
- **Hot-reload**: Dynamic engine configuration updates

### Development Workflow
- **Make**: Build automation and shortcuts
- **Python virtual environments**: Dependency isolation
- **npm/pnpm**: Frontend package management
- **Git hooks**: Pre-commit quality checks

## Configuration Files

### Backend Configuration (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kurobe
REDIS_URL=redis://localhost:6379/0

# API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# Observability
LANGFUSE_PUBLIC_KEY=pk-xxx
LANGFUSE_SECRET_KEY=sk-xxx
SENTRY_DSN=https://xxx@sentry.io/xxx

# Security
SECRET_KEY=your-secret-key
API_KEY_PREFIX=kb_
```

### Engine Configuration (`config/engines.yaml`)
```yaml
text_to_sql:
  default:
    provider: "anthropic"
    config:
      model: "claude-3-opus-20240229"
      temperature: 0.1

visualization:
  default:
    provider: "rule_based"
    config:
      rules: [...]

semantic:
  default:
    provider: "anthropic"
    config:
      model: "claude-3-sonnet-20240229"
```

### Frontend Configuration (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENVIRONMENT=development
```

## Development Setup

### Quick Start
```bash
# Copy configuration
cp config.sample.env backend/.env

# Start infrastructure + backend
python start.py

# Or use make commands
make dev          # Full development stack
make backend      # Backend only
make frontend     # Frontend only
make docker-up    # Infrastructure only
```

### Manual Setup
```bash
# Backend
cd backend
pip install -e .
make migrate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# SDK
cd sdk
pip install -e .
```

## Database Setup

### Migrations
- **Location**: `backend/postgres/migrations/`
- **Pattern**: `001_initial_schema.sql`, `002_feature_name.sql`
- **Idempotent**: Safe to run multiple times
- **Command**: `make migrate`

### Schema Highlights
- **UUIDs**: All primary keys use UUID v4
- **Timestamps**: Automatic `created_at`/`updated_at` triggers
- **RLS**: Row-level security for multi-tenancy
- **JSONB**: Flexible configuration storage
- **Audit**: Complete audit trail in `audit_log` table

## Performance Considerations

### Database Optimization
- **Connection pooling**: SQLAlchemy async pool
- **Query caching**: Redis with configurable TTL
- **Indexing**: Comprehensive index strategy
- **Query timeouts**: 30s default, 5min maximum

### Frontend Optimization
- **Code splitting**: Next.js automatic splitting
- **Lazy loading**: React.lazy for heavy components
- **Bundle analysis**: Built-in Next.js analyzer
- **Image optimization**: Next.js image component

### API Performance
- **Async everywhere**: Non-blocking I/O operations
- **Response streaming**: Large datasets streamed
- **Rate limiting**: Redis-backed rate limits
- **Background jobs**: Heavy operations queued

## Security Architecture

### Authentication Flow
1. API key validation via middleware
2. JWT token extraction and validation
3. User context injection into request state
4. RLS policy enforcement at database level

### Data Protection
- **Encryption at rest**: Sensitive credentials encrypted
- **SQL injection prevention**: Parameterized queries only
- **CORS configuration**: Environment-specific origins
- **Input validation**: Pydantic models throughout

### Audit & Compliance
- **Complete audit trail**: All actions logged
- **IP tracking**: Request origin logging
- **User context**: Every action tied to user
- **Retention policies**: Configurable log retention

This technology stack provides enterprise-grade reliability while maintaining developer productivity through modern tooling and comprehensive type safety.
