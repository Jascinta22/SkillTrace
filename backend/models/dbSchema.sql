CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('candidate', 'hr')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    skills TEXT[],
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    expected_answer TEXT,
    points INTEGER DEFAULT 10
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT,
    score INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Behavior Logs Table
CREATE TABLE IF NOT EXISTS behavior_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    tab_switch_count INTEGER DEFAULT 0,
    copy_paste_count INTEGER DEFAULT 0,
    focus_loss_count INTEGER DEFAULT 0,
    ai_usage_flag BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skill Scores Table
CREATE TABLE IF NOT EXISTS skill_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    coding_score INTEGER DEFAULT 0,
    debugging_score INTEGER DEFAULT 0,
    decision_score INTEGER DEFAULT 0,
    communication_score INTEGER DEFAULT 0,
    integrity_score INTEGER DEFAULT 100,
    overall_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- ============== SECURITY: MFA Settings Table ==============
CREATE TABLE IF NOT EXISTS mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_type VARCHAR(50) CHECK (mfa_type IN ('totp', 'sms', 'email')) DEFAULT 'totp',
    secret_key VARCHAR(255),
    backup_codes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============== SECURITY: Audit Logs Table ==============
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50) CHECK (status IN ('success', 'failure')) DEFAULT 'success',
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_action ON audit_logs (user_id, action);
CREATE INDEX IF NOT EXISTS idx_created_at ON audit_logs (created_at);

-- ============== SECURITY: Data Encryption Keys ==============
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(255) NOT NULL,
    key_version INTEGER DEFAULT 1,
    key_data BYTEA NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rotated_at TIMESTAMP WITH TIME ZONE
);

-- ============== SECURITY: Rate Limiting ==============
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour'
);

-- ============== CHEATING DETECTION: Cheating Flags Table ==============
CREATE TABLE IF NOT EXISTS cheating_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    flag_type VARCHAR(100) CHECK (flag_type IN ('copy_paste', 'external_resource', 'keystroke_anomaly', 'tab_switch', 'multiple_devices')) NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    details JSONB,
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_challenge ON cheating_flags (user_id, challenge_id);

-- ============== CHEATING DETECTION: Keystroke Analysis ==============
CREATE TABLE IF NOT EXISTS keystroke_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    keystroke_pattern JSONB,
    typing_speed DECIMAL(5, 2),
    dwell_time DECIMAL(5, 2),
    flight_time DECIMAL(5, 2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============== ANALYTICS: Performance Cache ==============
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_data JSONB NOT NULL,
    metric_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============== ANALYTICS: Benchmarking Data ==============
CREATE TABLE IF NOT EXISTS benchmark_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    skill_type VARCHAR(100),
    percentile_10 DECIMAL(5, 2),
    percentile_25 DECIMAL(5, 2),
    percentile_50 DECIMAL(5, 2),
    percentile_75 DECIMAL(5, 2),
    percentile_90 DECIMAL(5, 2),
    avg_score DECIMAL(5, 2),
    total_submissions INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============== INTEGRATION: ATS Integration ==============
CREATE TABLE IF NOT EXISTS ats_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(255),
    provider VARCHAR(100) CHECK (provider IN ('workday', 'greenhouse', 'lever', 'breezy', 'custom')) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sync_interval INTEGER DEFAULT 3600,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============== INTEGRATION: Webhook Events ==============
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES ats_integrations(id) ON DELETE CASCADE,
    event_type VARCHAR(100),
    payload JSONB NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- ============== INTEGRATION: SSO Configuration ==============
CREATE TABLE IF NOT EXISTS sso_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(100) CHECK (provider IN ('okta', 'azure_ad', 'google', 'saml')) NOT NULL,
    provider_url VARCHAR(255),
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============== COMPLIANCE: Consent Records ==============
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) CHECK (consent_type IN ('privacy_policy', 'data_processing', 'marketing', 'analytics')) NOT NULL,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_version VARCHAR(50),
    consented_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

-- ============== COMPLIANCE: Data Retention Policy ==============
CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_type VARCHAR(100) NOT NULL,
    retention_days INTEGER DEFAULT 365,
    auto_delete BOOLEAN DEFAULT FALSE,
    archive_before_delete BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============== COMPLIANCE: GDPR Data Deletion Requests ==============
CREATE TABLE IF NOT EXISTS gdpr_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_status VARCHAR(50) CHECK (request_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    request_reason TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL
);