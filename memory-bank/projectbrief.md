# Kurobe BI Platform - Project Brief

## Core Mission
Kurobe is a production-ready, configuration-driven BI chat platform that transforms natural language questions into interactive dashboard panels. Built with enterprise-grade architecture, it supports multiple data sources and pluggable AI engines.

## Key Innovation
**Question-Driven Dashboards**: Each chat session represents one "question" that materializes into one or more dashboard panels. Users can pin panels to create persistent dashboards, effectively building analytics through conversation.

## Primary Goals

### 1. Configuration-Driven Architecture
- Swap Text-to-SQL, visualization, and semantic engines via YAML configuration
- No code changes required to switch between AI providers (Anthropic, OpenAI, local models)
- Hot-swappable engine system with registry pattern
- Extensible engine interface for custom implementations

### 2. Multi-Database Support
- Native connectors for PostgreSQL, Trino/Presto, and DuckDB
- Connection pooling with health monitoring
- Query caching and result optimization
- Secure credential storage with encryption

### 3. Enterprise Features
- Row-level security for multi-tenant isolation
- Comprehensive audit logging for compliance
- API key authentication with rate limiting
- Real-time query execution monitoring
- Structured error handling and observability

### 4. Developer Experience
- Comprehensive SDK for client integration
- Type-safe interfaces throughout (TypeScript frontend, Python type hints)
- Clean separation between UI, orchestration, and engines
- Extensive documentation and examples

## Core User Flows

### Primary Flow: Question to Dashboard
1. User asks natural language question: "Show me monthly sales trends for 2024"
2. Semantic engine analyzes intent and creates execution plan
3. Text-to-SQL engine generates appropriate queries
4. Queries execute against configured data sources
5. Visualization engine recommends chart types based on results
6. One or more panels are generated and displayed
7. User can pin panels to create persistent dashboards
8. User can continue conversation to refine or expand analysis

### Secondary Flows
- Dashboard creation and management
- Data connection configuration
- Engine configuration and monitoring
- Team collaboration and sharing

## Technical Requirements

### Performance
- Query execution timeouts (30s default, 5min max)
- Connection pooling for database efficiency
- Redis caching for query results and session management
- Async/await patterns throughout for non-blocking operations

### Security
- JWT-based authentication with API key support
- Row-level security policies in PostgreSQL
- Encrypted storage of sensitive credentials
- SQL injection prevention through parameterized queries
- CORS configuration for frontend access

### Scalability
- Pluggable engine architecture for horizontal scaling
- Background job processing with Dramatiq
- Connection pooling for multiple databases
- Stateless API design for load balancing

## Success Metrics
1. **Developer Adoption**: Easy SDK integration and clear documentation
2. **Configuration Flexibility**: Ability to swap engines without code changes
3. **Query Performance**: Sub-second response times for typical BI queries
4. **Enterprise Readiness**: Full audit trails and security compliance
5. **User Experience**: Intuitive question-to-visualization flow

## Project Constraints
- Python 3.11+ required for backend
- Next.js 15+ for frontend with TypeScript
- PostgreSQL 15+ with RLS support
- Redis 6+ for caching and job queues
- Docker support for development environment

## Out of Scope (Current Phase)
- Advanced user management and permissions (beyond basic RLS)
- Real-time collaboration features
- Advanced dashboard templating
- Mobile-specific UI optimizations
- On-premises deployment automation

This project builds upon patterns from the Kortix/Suna project, adapted specifically for BI use cases with a focus on configuration-driven architecture and enterprise readiness.
