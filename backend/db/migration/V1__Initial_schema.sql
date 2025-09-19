-- Kurobe BI Platform Initial Schema
-- This creates the core tables for the BI chat application
-- Flyway migration V1

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE engine_type AS ENUM ('text_to_sql', 'visualization', 'semantic');
CREATE TYPE question_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE chart_type AS ENUM ('line', 'bar', 'pie', 'scatter', 'area', 'table', 'metric', 'heatmap', 'gauge', 'funnel');

-- Users table (simplified - can integrate with existing auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys for authentication
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT api_keys_user_id_name_unique UNIQUE (user_id, name)
);

CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Data connections configuration
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- postgres, trino, duckdb
    config JSONB NOT NULL, -- encrypted connection details
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_tested_at TIMESTAMPTZ,
    
    CONSTRAINT connections_name_unique UNIQUE (name)
);

CREATE INDEX idx_connections_created_by ON connections(created_by);
CREATE INDEX idx_connections_type ON connections(type);

-- Engine configurations
CREATE TABLE IF NOT EXISTS engine_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engine_type engine_type NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT engine_configs_type_name_unique UNIQUE (engine_type, name),
    CONSTRAINT engine_configs_one_default_per_type EXCLUDE (engine_type WITH =) WHERE (is_default = true)
);

CREATE INDEX idx_engine_configs_engine_type ON engine_configs(engine_type);

-- Questions (chat sessions)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    plan JSONB DEFAULT NULL,
    status question_status DEFAULT 'pending',
    error TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT questions_text_not_empty CHECK (LENGTH(TRIM(text)) > 0)
);

CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

-- Panels (visualizations generated from questions)
CREATE TABLE IF NOT EXISTS panels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    spec JSONB NOT NULL, -- PanelSpec data
    is_pinned BOOLEAN DEFAULT false,
    position JSONB DEFAULT NULL, -- {"x": 0, "y": 0}
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_panels_question_id ON panels(question_id);
CREATE INDEX idx_panels_created_by ON panels(created_by);
CREATE INDEX idx_panels_is_pinned ON panels(is_pinned) WHERE is_pinned = true;

-- Dashboards (collections of pinned panels)
CREATE TABLE IF NOT EXISTS dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '{}', -- Grid layout configuration
    refresh_interval INTEGER, -- seconds, NULL = no auto-refresh
    filters JSONB DEFAULT '{}', -- Global filters
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT dashboards_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_dashboards_is_public ON dashboards(is_public) WHERE is_public = true;
CREATE INDEX idx_dashboards_tags ON dashboards USING GIN(tags);

-- Dashboard panels (many-to-many relationship)
CREATE TABLE IF NOT EXISTS dashboard_panels (
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
    position JSONB DEFAULT NULL, -- Override position for this dashboard
    added_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (dashboard_id, panel_id)
);

CREATE INDEX idx_dashboard_panels_panel_id ON dashboard_panels(panel_id);

-- Chat messages (conversation history)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_question_id ON chat_messages(question_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Query history (for caching and auditing)
CREATE TABLE IF NOT EXISTS query_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    query_hash VARCHAR(64) NOT NULL, -- SHA256 of normalized query
    result_row_count INTEGER,
    execution_time_ms FLOAT,
    error TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_history_question_id ON query_history(question_id);
CREATE INDEX idx_query_history_connection_id ON query_history(connection_id);
CREATE INDEX idx_query_history_query_hash ON query_history(query_hash);
CREATE INDEX idx_query_history_created_by ON query_history(created_by);
CREATE INDEX idx_query_history_created_at ON query_history(created_at DESC);

-- Audit log for compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engine_configs_updated_at BEFORE UPDATE ON engine_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panels_updated_at BEFORE UPDATE ON panels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own questions
CREATE POLICY questions_owner_policy ON questions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- Users can only see their own panels
CREATE POLICY panels_owner_policy ON panels
    FOR ALL USING (created_by = current_setting('app.current_user_id')::UUID);

-- Users can see their own dashboards and public dashboards
CREATE POLICY dashboards_visibility_policy ON dashboards
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id')::UUID 
        OR is_public = true
    );

-- Users can only modify their own dashboards
CREATE POLICY dashboards_modify_policy ON dashboards
    FOR INSERT, UPDATE, DELETE USING (user_id = current_setting('app.current_user_id')::UUID);

-- Connection visibility based on permissions (simplified for now)
CREATE POLICY connections_policy ON connections
    FOR SELECT USING (
        created_by = current_setting('app.current_user_id')::UUID
        OR current_setting('app.is_superuser')::BOOLEAN = true
    );

-- End of migration
