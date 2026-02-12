-- ============================================================
-- REFiND Platform - Database Migration 00003
-- Indexes for performance optimization
-- ============================================================

-- ============================================================
-- GEOSPATIAL INDEXES (Critical for map and matching)
-- ============================================================
CREATE INDEX idx_posts_location
    ON posts USING GIST (location);

CREATE INDEX idx_posts_route_geometry
    ON posts USING GIST (route_geometry)
    WHERE route_geometry IS NOT NULL;

CREATE INDEX idx_alert_zones_center
    ON user_alert_zones USING GIST (center);

-- ============================================================
-- VECTOR INDEXES (AI similarity matching)
-- ============================================================
-- IVFFlat index for approximate nearest neighbor search
-- lists = sqrt(row_count) is a good starting point; adjust as data grows
CREATE INDEX idx_posts_ai_embedding
    ON posts USING ivfflat (ai_embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX idx_post_images_ai_embedding
    ON post_images USING ivfflat (ai_embedding vector_cosine_ops)
    WITH (lists = 100);

-- ============================================================
-- COMPOSITE INDEXES (Feed and filtering)
-- ============================================================

-- Active posts feed (most common query)
CREATE INDEX idx_posts_active_feed
    ON posts (created_at DESC)
    WHERE status = 'active';

-- Posts by type + category (filtered feed)
CREATE INDEX idx_posts_type_category_active
    ON posts (type, category, created_at DESC)
    WHERE status = 'active';

-- User's own posts
CREATE INDEX idx_posts_user_id
    ON posts (user_id, created_at DESC);

-- Posts expiry (for cleanup job)
CREATE INDEX idx_posts_expires_at
    ON posts (expires_at)
    WHERE status = 'active';

-- Boosted posts (monetization feature)
CREATE INDEX idx_posts_boosted
    ON posts (boost_expires_at DESC)
    WHERE is_boosted = true AND status = 'active';

-- ============================================================
-- MATCHING INDEXES
-- ============================================================
CREATE INDEX idx_matches_lost_post
    ON matches (lost_post_id);

CREATE INDEX idx_matches_found_post
    ON matches (found_post_id);

CREATE INDEX idx_matches_pending
    ON matches (created_at DESC)
    WHERE status = 'pending';

-- ============================================================
-- CHAT INDEXES
-- ============================================================
CREATE INDEX idx_conversations_participants
    ON conversations USING GIN (participant_ids);

CREATE INDEX idx_conversations_last_message
    ON conversations (last_message_at DESC)
    WHERE status = 'active';

CREATE INDEX idx_messages_conversation_time
    ON messages (conversation_id, created_at DESC);

CREATE INDEX idx_messages_unread
    ON messages (conversation_id, is_read)
    WHERE is_read = false;

-- ============================================================
-- NOTIFICATION INDEXES
-- ============================================================
CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, created_at DESC)
    WHERE is_read = false;

CREATE INDEX idx_notifications_user_all
    ON notifications (user_id, created_at DESC);

CREATE INDEX idx_notifications_pending_push
    ON notifications (created_at)
    WHERE is_pushed = false;

-- ============================================================
-- REPORT INDEXES
-- ============================================================
CREATE INDEX idx_reports_pending
    ON reports (created_at DESC)
    WHERE status = 'pending';

CREATE INDEX idx_reports_target
    ON reports (target_type, target_id);

-- ============================================================
-- USER INDEXES
-- ============================================================
CREATE INDEX idx_users_auth_id
    ON users (auth_id);

CREATE INDEX idx_users_email_trgm
    ON users USING gin (email gin_trgm_ops);

CREATE INDEX idx_user_device_tokens_user
    ON user_device_tokens (user_id)
    WHERE is_active = true;

CREATE INDEX idx_user_alert_zones_user
    ON user_alert_zones (user_id)
    WHERE is_active = true;

-- ============================================================
-- AUDIT LOG INDEXES
-- ============================================================
CREATE INDEX idx_audit_logs_actor
    ON audit_logs (actor_id, created_at DESC);

CREATE INDEX idx_audit_logs_target
    ON audit_logs (target_type, target_id, created_at DESC);

CREATE INDEX idx_audit_logs_created
    ON audit_logs (created_at DESC);

-- ============================================================
-- TEXT SEARCH (for post search feature)
-- ============================================================
-- Add tsvector column for full-text search
ALTER TABLE posts ADD COLUMN search_vector tsvector;

CREATE INDEX idx_posts_search
    ON posts USING GIN (search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_search_vector
    BEFORE INSERT OR UPDATE OF title, description ON posts
    FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();
