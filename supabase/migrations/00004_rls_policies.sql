-- ============================================================
-- REFiND Platform - Database Migration 00004
-- Row Level Security (RLS) Policies
-- ============================================================

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's internal ID
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
    SELECT id FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper to check if current user is admin or moderator
CREATE OR REPLACE FUNCTION is_admin_or_mod()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
        AND role IN ('admin', 'moderator')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- USERS TABLE RLS
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read basic user profiles
CREATE POLICY "users_select_all"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- Users can only insert their own profile (during registration)
CREATE POLICY "users_insert_own"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth_id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- Admin can update any user (for moderation)
CREATE POLICY "users_update_admin"
    ON users FOR UPDATE
    TO authenticated
    USING (is_admin_or_mod())
    WITH CHECK (is_admin_or_mod());

-- ============================================================
-- POSTS TABLE RLS
-- ============================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read active posts; owners can see their own regardless of status
CREATE POLICY "posts_select"
    ON posts FOR SELECT
    TO authenticated
    USING (
        status = 'active'
        OR user_id = get_user_id()
        OR is_admin_or_mod()
    );

-- Authenticated users can create posts
CREATE POLICY "posts_insert"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (user_id = get_user_id());

-- Only post owner can update their post
CREATE POLICY "posts_update_own"
    ON posts FOR UPDATE
    TO authenticated
    USING (user_id = get_user_id())
    WITH CHECK (user_id = get_user_id());

-- Admin/moderator can update any post (for moderation)
CREATE POLICY "posts_update_admin"
    ON posts FOR UPDATE
    TO authenticated
    USING (is_admin_or_mod());

-- Only post owner or admin can delete
CREATE POLICY "posts_delete"
    ON posts FOR DELETE
    TO authenticated
    USING (
        user_id = get_user_id()
        OR is_admin_or_mod()
    );

-- Allow anonymous read for public map view
CREATE POLICY "posts_select_anon"
    ON posts FOR SELECT
    TO anon
    USING (status = 'active');

-- ============================================================
-- POST IMAGES TABLE RLS
-- ============================================================
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images of visible posts
CREATE POLICY "post_images_select"
    ON post_images FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_images.post_id
            AND (posts.status = 'active' OR posts.user_id = get_user_id())
        )
    );

-- Anonymous can see images of active posts
CREATE POLICY "post_images_select_anon"
    ON post_images FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_images.post_id
            AND posts.status = 'active'
        )
    );

-- Only post owner can insert images
CREATE POLICY "post_images_insert"
    ON post_images FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_images.post_id
            AND posts.user_id = get_user_id()
        )
    );

-- Only post owner can delete images
CREATE POLICY "post_images_delete"
    ON post_images FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_images.post_id
            AND posts.user_id = get_user_id()
        )
        OR is_admin_or_mod()
    );

-- ============================================================
-- MATCHES TABLE RLS
-- ============================================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can see matches involving their posts
CREATE POLICY "matches_select"
    ON matches FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM posts
            WHERE (posts.id = matches.lost_post_id OR posts.id = matches.found_post_id)
            AND posts.user_id = get_user_id()
        )
        OR is_admin_or_mod()
    );

-- Only the system (service role) creates matches, but allow update for confirmations
CREATE POLICY "matches_update"
    ON matches FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM posts
            WHERE (posts.id = matches.lost_post_id OR posts.id = matches.found_post_id)
            AND posts.user_id = get_user_id()
        )
    );

-- ============================================================
-- CONVERSATIONS TABLE RLS
-- ============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Only participants can see their conversations
CREATE POLICY "conversations_select"
    ON conversations FOR SELECT
    TO authenticated
    USING (get_user_id() = ANY(participant_ids) OR is_admin_or_mod());

-- Participants can update (close) conversations
CREATE POLICY "conversations_update"
    ON conversations FOR UPDATE
    TO authenticated
    USING (get_user_id() = ANY(participant_ids));

-- ============================================================
-- MESSAGES TABLE RLS
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Only conversation participants can read messages
CREATE POLICY "messages_select"
    ON messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND get_user_id() = ANY(conversations.participant_ids)
        )
    );

-- Only conversation participants can send messages
CREATE POLICY "messages_insert"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = get_user_id()
        AND EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND get_user_id() = ANY(conversations.participant_ids)
            AND conversations.status = 'active'
        )
    );

-- ============================================================
-- NOTIFICATIONS TABLE RLS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications_select"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = get_user_id());

-- Users can update (mark as read) their own notifications
CREATE POLICY "notifications_update"
    ON notifications FOR UPDATE
    TO authenticated
    USING (user_id = get_user_id())
    WITH CHECK (user_id = get_user_id());

-- ============================================================
-- REPORTS TABLE RLS
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can see their own reports
CREATE POLICY "reports_select_own"
    ON reports FOR SELECT
    TO authenticated
    USING (reporter_id = get_user_id() OR is_admin_or_mod());

-- Any authenticated user can create a report
CREATE POLICY "reports_insert"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (reporter_id = get_user_id());

-- Only admins/moderators can update reports
CREATE POLICY "reports_update_admin"
    ON reports FOR UPDATE
    TO authenticated
    USING (is_admin_or_mod());

-- ============================================================
-- REWARDS TABLE RLS
-- ============================================================
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Anyone can view rewards (shown on post cards)
CREATE POLICY "rewards_select"
    ON rewards FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "rewards_select_anon"
    ON rewards FOR SELECT
    TO anon
    USING (true);

-- Only post owner can create/update rewards
CREATE POLICY "rewards_insert"
    ON rewards FOR INSERT
    TO authenticated
    WITH CHECK (offered_by = get_user_id());

CREATE POLICY "rewards_update"
    ON rewards FOR UPDATE
    TO authenticated
    USING (offered_by = get_user_id());

-- ============================================================
-- USER DEVICE TOKENS TABLE RLS
-- ============================================================
ALTER TABLE user_device_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own device tokens
CREATE POLICY "device_tokens_select"
    ON user_device_tokens FOR SELECT
    TO authenticated
    USING (user_id = get_user_id());

CREATE POLICY "device_tokens_insert"
    ON user_device_tokens FOR INSERT
    TO authenticated
    WITH CHECK (user_id = get_user_id());

CREATE POLICY "device_tokens_update"
    ON user_device_tokens FOR UPDATE
    TO authenticated
    USING (user_id = get_user_id());

CREATE POLICY "device_tokens_delete"
    ON user_device_tokens FOR DELETE
    TO authenticated
    USING (user_id = get_user_id());

-- ============================================================
-- USER ALERT ZONES TABLE RLS
-- ============================================================
ALTER TABLE user_alert_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alert_zones_select"
    ON user_alert_zones FOR SELECT
    TO authenticated
    USING (user_id = get_user_id());

CREATE POLICY "alert_zones_insert"
    ON user_alert_zones FOR INSERT
    TO authenticated
    WITH CHECK (user_id = get_user_id());

CREATE POLICY "alert_zones_update"
    ON user_alert_zones FOR UPDATE
    TO authenticated
    USING (user_id = get_user_id());

CREATE POLICY "alert_zones_delete"
    ON user_alert_zones FOR DELETE
    TO authenticated
    USING (user_id = get_user_id());

-- ============================================================
-- AUDIT LOGS TABLE RLS
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "audit_logs_select_admin"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (is_admin_or_mod());

-- Insert is done via service role (backend only), no direct user access
