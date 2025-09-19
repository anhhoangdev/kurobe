# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start
```bash
# Start everything (infrastructure + backend)
python start.py

# Or use make commands
make dev                    # Start development environment
make install               # Install all dependencies
```

### Backend Development
```bash
cd backend
pip install -e ".[dev]"               # Install backend dependencies
uvicorn app.main:app --reload          # Start API server
pytest -v                             # Run tests
black . && ruff check --fix .         # Format and lint code
mypy app                              # Type checking

# Database migrations with Flyway
flyway -configFiles=flyway.conf migrate      # Run migrations
flyway -configFiles=flyway.conf info         # Check migration status
```

### Frontend Development
```bash
cd frontend
npm install                  # Install dependencies
npm run dev                 # Start development server (with Turbopack)
npm run build              # Build for production
npm run lint               # Lint code
npm run typecheck          # Type checking
npm test                   # Run tests
npm run format             # Format code with Prettier
```

### SDK Development
```bash
cd sdk
pip install -e ".[dev]"    # Install SDK in development mode
pytest -v                  # Run SDK tests
```

### Infrastructure
```bash
make docker-up             # Start PostgreSQL and Redis
make docker-down           # Stop Docker services
make migrate              # Run Flyway migrations
make migrate-info         # Check migration status
make db-reset             # Reset database
```

## Architecture Overview

### Core Stack
- **Frontend**: Next.js 15+ with App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Python 3.11+ with FastAPI, PostgreSQL, Redis, pluggable engine system
- **SDK**: Kurobe SDK with bi_sdk and agents_sdk modules
- **Database**: PostgreSQL with Row Level Security (RLS), supporting Trino/Presto, DuckDB

### Key Architectural Patterns

#### Question-Driven Dashboards
- Each chat session represents one "question" that materializes into dashboard panels
- Natural language queries converted to SQL via pluggable Text-to-SQL engines
- Smart visualization recommendations based on query results
- Pinnable panels for persistent dashboards

#### Configuration-Driven Engine System
- Engines configured in `config/engines.yaml` - no code changes needed to swap providers
- Three engine types: Text-to-SQL, Visualization, Semantic
- Support for Anthropic, OpenAI, and local models via LiteLLM
- Hot-swappable engines with runtime registration

#### Multi-Database Architecture
- Connection pool supporting PostgreSQL, Trino/Presto, DuckDB
- Secure credential storage with encryption using Fernet
- Query caching and connection health monitoring
- Row-level security for multi-tenant isolation

### Project Structure
```
project/
├── frontend/              # Next.js application
│   └── src/
│       ├── app/          # Next.js app router pages
│       ├── components/   # Reusable React components
│       │   ├── chat/    # Chat interface components
│       │   ├── panels/  # Visualization panel components
│       │   └── dashboard/ # Dashboard builder components
│       └── lib/         # Utilities and configurations
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core functionality
│   │   ├── engines/     # Pluggable engine implementations
│   │   └── services/    # Business logic services
│   └── postgres/        # Database migrations
├── sdk/                  # Kurobe SDK
│   └── kurobe/
│       ├── core/        # Core models and interfaces
│       ├── bi/          # BI-specific functionality
│       └── api/         # API client implementations
└── config/              # Engine configuration files
```

## Development Practices

### Backend (FastAPI + Python)
- Use Python 3.11+ with comprehensive type hints
- Follow async/await patterns for all I/O operations
- Use dependency injection for database connections and services
- Implement proper request/response models with Pydantic v2
- Use SQLAlchemy 2.0+ with asyncpg for PostgreSQL
- Structure logging with context using structlog
- Background jobs with Dramatiq and Redis
- LLM integration via LiteLLM with proper error handling

### Frontend (Next.js + TypeScript)
- Use Next.js 15+ App Router with TypeScript strict mode
- shadcn/ui as primary component library
- State management: @tanstack/react-query for server state, React hooks for local state
- Form handling: react-hook-form with Zod validation
- Styling: Tailwind CSS with shadcn/ui components
- Data visualization: Recharts for charts and graphs

### Database Patterns
- PostgreSQL with Row Level Security (RLS) enabled
- UUID primary keys with proper foreign key constraints
- Idempotent migrations with proper error handling
- Automated timestamp management with triggers
- Connection pooling with health checks

### Security & Authentication
- API key authentication with secure generation/validation
- JWT token validation for Supabase integration
- Encrypted credential storage for database connections
- SQL injection prevention with parameterized queries
- Comprehensive audit logging for compliance

## Key Dependencies

### Backend Core
- FastAPI 0.115+ (API framework)
- SQLAlchemy 2.0+ (ORM)
- LiteLLM 1.72+ (multi-provider LLM integration)
- Dramatiq 1.18+ (background jobs)
- Langfuse 2.0+ (LLM observability)

### Frontend Core
- Next.js 15+ with Turbopack
- @tanstack/react-query 5+ (data fetching)
- shadcn/ui components
- Recharts 2+ (data visualization)

## Configuration Files

### Engine Configuration (`config/engines.yaml`)
```yaml
text_to_sql:
  default:
    provider: "anthropic"
    config:
      model: "claude-3-opus-20240229"
      api_key: ${ANTHROPIC_API_KEY}
```

### Environment Setup
- Backend: `backend/.env` - API keys, database connections, service configuration
- Frontend: `frontend/.env.local` - API URL and frontend-specific variables
- Use Docker Compose for PostgreSQL and Redis in development

## Testing Strategy
- Backend: pytest with asyncio support, factory-boy for test fixtures
- Frontend: Jest for unit tests, testing-library for component tests
- Integration tests for API endpoints with real database
- Performance testing for engine execution and query optimization

## Monitoring & Observability
- Langfuse for LLM call tracing and performance monitoring
- Sentry for error tracking across frontend and backend
- Prometheus metrics for service monitoring
- Structured logging throughout the application stack

## Database Migrations

### Flyway Setup
- **Migration Tool**: Flyway for database schema versioning
- **Configuration**: `backend/flyway.conf` contains database connection settings
- **Migration Files**: Located in `backend/db/migration/`
- **Naming Convention**: `V<version>__<description>.sql` (e.g., `V1__Initial_schema.sql`)

### Creating New Migrations
```bash
# 1. Create new migration file
touch backend/db/migration/V2__Add_new_feature.sql

# 2. Add your SQL DDL statements to the file
# 3. Run migration
make migrate

# Check migration status
make migrate-info
```

### Database Setup
- PostgreSQL database with user `kurobe` and database `kurobe`
- Row Level Security (RLS) enabled on all user-accessible tables
- Custom types for enums (engine_type, question_status, chart_type)
- Comprehensive audit logging built into the schema

## Special Considerations
- Follows patterns adapted from Kortix/Suna project for BI-specific use cases
- Prioritize configuration-driven design over hardcoded implementations
- Engine system supports runtime swapping without service restarts
- Panel specifications are flexible and support multiple visualization types
- Connection management includes health checks and automatic failover
- Uses Flyway for robust database migration management