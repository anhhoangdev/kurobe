# Kurobe Agents-to-Agents Core Engine Design

## Executive Summary

This document contains the complete architectural design for Kurobe's Agents-to-Agents system, implementing the XiYan-SQL framework with multi-LLM provider support. The design focuses on two core SQL generators (Fine-tuned and ICL) with proper OOP architecture following SOLID principles.

## System Overview

The Agents-to-Agents system transforms Kurobe from a simple question-to-panel platform into a sophisticated multi-agent BI system that:

1. **Validates User Intent** through interactive multi-turn conversations
2. **Generates Multiple SQL Candidates** using Fine-tuned and ICL approaches
3. **Provides Transparent Selection** through Gemini-style staging interface
4. **Supports Multiple LLM Providers** with configuration-driven flexibility

## Core Architecture Components

### 1. Multi-LLM Provider System

```
backend/app/providers/
├── interfaces.py           # Abstract ILLMProvider interface
├── anthropic_provider.py   # Anthropic Claude integration  
├── openai_provider.py      # OpenAI GPT integration
├── local_provider.py       # Local model support
└── factory.py             # Provider factory and registry
```

**Key Features:**
- Abstract interface ensuring provider interchangeability
- Factory pattern for configuration-driven instantiation
- Comprehensive error handling and retry logic
- Unified response format across all providers

### 2. XiYan-SQL Framework Implementation

```
backend/app/engines/xiyan/
├── m_schema.py                    # M-Schema generation and optimization
├── schema_linking.py              # Keyword extraction and relevance filtering
└── candidate_generation/
    ├── interfaces.py              # Core generator interfaces
    ├── fine_tuned_generator.py    # Two-stage fine-tuned generation
    ├── icl_generator.py           # In-context learning with skeleton similarity
    ├── sql_refiner.py             # SQL optimization and error correction
    └── hub.py                     # Candidate Generation Hub orchestrator
```

**Key Features:**
- **M-Schema**: Enhanced database representation for LLM consumption
- **Schema Linking**: Intelligent filtering of relevant tables/columns
- **Fine-tuned Generator**: Basic syntax + enhanced generation stages
- **ICL Generator**: Skeleton similarity matching with example selection
- **SQL Refiner**: Syntax validation, optimization, error correction
- **Hub Orchestrator**: Parallel execution with deduplication and ranking

### 3. Agent System Architecture

```
backend/app/agents/
├── base/
│   └── agent.py                   # Abstract agent base classes
├── intent/
│   └── validation_agent.py        # Intent validation and refinement
├── selection/
│   └── selection_agent.py         # Candidate selection and ranking
└── orchestrator.py               # Agent pipeline management
```

**Key Features:**
- Template method pattern for consistent agent behavior
- SOLID principles with dependency injection
- Type-safe interfaces with comprehensive error handling
- Multi-turn conversation management

### 4. Frontend Staging System

```
frontend/src/components/staging/
├── candidate-selection.tsx        # Gemini-style candidate selection
├── agent-conversation.tsx         # Multi-stage conversation flow
├── intent-validation.tsx          # Interactive intent validation
└── generation-progress.tsx        # Real-time progress display
```

**Key Features:**
- Transparent candidate presentation with reasoning
- Interactive selection with preview capabilities
- Real-time progress indicators for generation stages
- Seamless integration with existing chat interface

## Implementation Workflow

### User Experience Flow

1. **Intent Validation**
   - User asks question
   - Intent Validation Agent analyzes clarity
   - Interactive refinement dialog if needed
   - User confirms validated intent

2. **Candidate Generation**
   - Schema Linking optimizes M-Schema for question
   - Fine-tuned Generator creates basic + enhanced SQL
   - ICL Generator uses skeleton similarity for examples
   - SQL Refiner optimizes all candidates
   - Hub orchestrator deduplicates and ranks

3. **Candidate Selection**
   - Frontend displays candidates with reasoning
   - User can preview expected results
   - Selection Agent provides recommendations
   - User selects preferred approach

4. **Panel Generation**
   - Selected SQL executes against database
   - Results transform into visualization panels
   - Panels integrate with existing Kurobe system

### Technical Implementation Flow

1. **Multi-LLM Provider Setup**
   - Abstract interfaces define provider contracts
   - Factory creates configured provider instances
   - Agents receive providers via dependency injection

2. **Agent Pipeline Execution**
   - Orchestrator manages agent sequence
   - Context passes between agents maintaining state
   - Error handling at each stage with fallbacks

3. **Candidate Generation Process**
   - Parallel execution of multiple generators
   - Real-time progress updates to frontend
   - Deduplication and quality filtering
   - Ranking based on confidence and diversity

## Configuration System

### YAML-Driven Configuration

```yaml
# config/agents.yaml
providers:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    default_model: "claude-3-sonnet-20240229"
  
  openai:
    api_key: ${OPENAI_API_KEY}
    default_model: "gpt-4-turbo-preview"

candidate_generation:
  fine_tuned:
    max_candidates: 3
    provider: "openai"
    temperature: 0.2
  
  icl:
    max_examples: 5
    similarity_threshold: 0.7
    provider: "anthropic"

agents:
  intent_validation:
    provider: "anthropic"
    confidence_threshold: 0.7
  
  candidate_selection:
    provider: "anthropic"
    selection_criteria:
      correctness_weight: 0.5
      performance_weight: 0.3
      readability_weight: 0.2
```

## Key Design Principles

### 1. SOLID Principles Implementation

- **Single Responsibility**: Each agent has one clear purpose
- **Open/Closed**: New providers and agents extensible without modification
- **Liskov Substitution**: All providers interchangeable through interface
- **Interface Segregation**: Separate interfaces for different capabilities
- **Dependency Inversion**: Agents depend on abstractions, not implementations

### 2. Configuration-Driven Design

- Provider selection through YAML configuration
- Agent behavior customization without code changes
- Hot-swappable components for different use cases
- Environment-specific configuration support

### 3. Error Handling & Resilience

- Comprehensive error boundaries at each stage
- Graceful degradation with fallback providers
- Retry logic with exponential backoff
- Structured error responses with context

### 4. Performance & Scalability

- Parallel candidate generation for speed
- Efficient deduplication and ranking algorithms
- Connection pooling for database operations
- Caching strategies for repeated operations

## Integration with Existing Kurobe

### Seamless Panel System Integration

The Agents-to-Agents system integrates with Kurobe's existing panel system:
- Selected SQL candidates execute through existing connection pool
- Results transform using existing panel generation logic
- Generated panels integrate with dashboard system
- Chat interface maintains existing thread management

### Backward Compatibility

- Existing simple question interface remains functional
- Advanced agent workflow optional for complex queries
- Configuration allows disabling agent features
- Gradual migration path for existing users

## Development Roadmap

### Phase 1: Core Engine Implementation (2-3 weeks)
- Multi-LLM provider system
- XiYan-SQL framework core components
- Agent base classes and orchestration
- Basic frontend staging interface

### Phase 2: Advanced Features (1-2 weeks)
- Intent validation and refinement workflow
- SQL optimization and error correction
- Advanced candidate selection logic
- Performance optimization and caching

### Phase 3: Integration & Polish (1 week)
- Seamless integration with existing Kurobe
- Configuration system implementation
- Error handling and monitoring
- User testing and refinement

## Success Metrics

1. **Technical Excellence**
   - Type-safe implementation throughout
   - Comprehensive error handling
   - Performance within acceptable limits
   - Maintainable, extensible codebase

2. **User Experience**
   - Intuitive intent validation process
   - Transparent candidate selection
   - Improved SQL generation quality
   - Seamless integration with existing workflow

3. **System Reliability**
   - Graceful handling of provider failures
   - Consistent behavior across different LLMs
   - Robust error recovery mechanisms
   - Comprehensive logging and monitoring

## Conclusion

This Agents-to-Agents system design provides Kurobe with a sophisticated, enterprise-ready framework for advanced text-to-SQL generation. By implementing the proven XiYan-SQL framework with modern software engineering practices, the system delivers:

- **Advanced AI Capabilities** through multi-agent collaboration
- **Provider Flexibility** through abstract interfaces and configuration
- **User Transparency** through staging and candidate selection
- **System Reliability** through comprehensive error handling
- **Future Extensibility** through SOLID principles and modular design

The design is ready for implementation, focusing only on the core engine components without API endpoints, providing a solid foundation for Kurobe's evolution into a next-generation BI platform.
