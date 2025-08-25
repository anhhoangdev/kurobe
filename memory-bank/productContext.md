# Product Context - Why Kurobe Exists

## The Problem We're Solving

### Traditional BI Pain Points
1. **Static Dashboards**: Traditional BI tools create fixed dashboards that require technical expertise to modify
2. **Query Complexity**: Business users can't easily explore data without SQL knowledge
3. **Context Switching**: Users must switch between chat/collaboration tools and BI dashboards
4. **Vendor Lock-in**: Most BI platforms tie you to specific data sources or visualization engines

### The Gap in Current Solutions
- **Chatbots vs Dashboards**: Current solutions are either conversational OR visual, not both
- **One-off Answers**: Chat-based BI tools give answers but don't build reusable artifacts
- **Configuration Rigidity**: Switching AI providers or visualization engines requires significant development

## Our Solution: Question-Driven Dashboards

### Core Innovation
**Each conversation becomes a dashboard builder.** Instead of separate chat and dashboard experiences, every question generates panels that can be pinned, arranged, and shared as persistent dashboards.

### User Journey
```
Ask Question → Get Panels → Pin & Arrange → Share Dashboard
     ↓              ↓            ↓            ↓
"Show sales"   [Line Chart]   [Dashboard]   [Team Access]
"By region"    [Bar Chart]    [Layout]      [Permissions]
"Top products" [Table]        [Filters]     [Embedding]
```

## Target Users

### Primary: Business Analysts
- **Need**: Quick data exploration without technical barriers
- **Goal**: Create insights and share findings with teams
- **Pain**: Current tools require SQL knowledge or IT support
- **Value**: Natural language to dashboard in minutes, not hours

### Secondary: Data Teams
- **Need**: Flexible BI infrastructure that doesn't lock them into specific vendors
- **Goal**: Provide self-service analytics to business users
- **Pain**: Constantly building custom dashboards for one-off requests
- **Value**: Configuration-driven platform that scales with team needs

### Tertiary: Executives
- **Need**: Quick access to key metrics without learning new tools
- **Goal**: Data-driven decision making in real-time
- **Pain**: Waiting for reports or struggling with complex BI tools
- **Value**: Conversational interface with professional visualizations

## Key Differentiators

### 1. Conversation-First Architecture
Unlike traditional BI tools that start with dashboards, we start with questions. Every interaction builds toward reusable artifacts.

### 2. Engine-Agnostic Design
Swap between Anthropic, OpenAI, or local models without changing code. Same flexibility for databases (Postgres, Trino, DuckDB) and visualization engines.

### 3. Enterprise-Grade Foundation
- Row-level security for multi-tenant deployments
- Complete audit trails for compliance
- API-first design for embedding and integration
- Pluggable architecture for custom extensions

### 4. Developer-Centric SDK
Comprehensive SDK allows embedding Kurobe into existing applications or building custom workflows around the question-to-dashboard pipeline.

## User Experience Goals

### Simplicity
- Natural language questions should feel like chatting with a data analyst
- Panel creation should be immediate and contextual
- Dashboard building should emerge organically from exploration

### Flexibility
- Users can switch between chat and dashboard views seamlessly
- Panels can be modified, rearranged, and customized post-creation
- Conversations can branch and merge to explore different angles

### Collaboration
- Dashboards are shareable with appropriate permissions
- Questions and panels include context for team understanding
- Audit trails show how insights were derived

### Performance
- Sub-second responses for typical BI queries
- Progressive loading for complex visualizations
- Caching to avoid redundant database queries

## Success Scenarios

### Scenario 1: Weekly Business Review
1. Analyst asks: "How did we perform last week compared to the same week last year?"
2. Gets time-series comparison panels
3. Pins panels and adds filters for different product lines
4. Shares dashboard link in Slack for team review

### Scenario 2: Executive Deep Dive
1. Executive asks: "What's driving our customer churn?"
2. Gets cohort analysis and correlation panels
3. Follows up: "Show me by customer segment"
4. Additional panels appear with segmented views
5. Entire conversation becomes a churn analysis dashboard

### Scenario 3: Data Team Enablement
1. Data team configures connections to new warehouse
2. Updates engine configuration to use local model for compliance
3. Business users immediately get access to new data sources
4. No code changes or redeployments required

## Competitive Landscape

### Direct Competitors
- **Tableau with Ask Data**: Static tool trying to add chat
- **Power BI Q&A**: Microsoft ecosystem lock-in
- **ThoughtSpot**: Search-first but limited conversation

### Indirect Competitors
- **ChatGPT with Code Interpreter**: Technical but not persistent
- **Looker**: Traditional BI with some natural language
- **Metabase**: Open source but configuration-rigid

### Our Advantage
We're building conversation-native, not retrofitting chat onto existing BI paradigms. Our configuration-driven architecture provides flexibility that others can't match without complete rebuilds.

## Metrics for Success

### User Engagement
- Questions per user per week
- Panels pinned to dashboards
- Dashboard sharing frequency
- Return usage patterns

### Technical Performance
- Query response times
- Engine swap success rates
- Database connection reliability
- Error rates and recovery

### Business Value
- Time from question to insight
- Dashboard creation velocity
- Team collaboration on shared dashboards
- Reduction in IT support requests

The ultimate goal: Make data exploration feel like a conversation that naturally builds lasting, shareable insights.
