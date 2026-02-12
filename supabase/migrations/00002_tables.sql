-- ============================================================
-- REFiND Platform - Database Migration 00002
-- Core tables
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id         UUID UNIQUE NOT NULL,  -- FK to auth.users (Supabase Auth)
    email           TEXT UNIQUE NOT NULL,
    display_name    TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 50),
    avatar_url      TEXT,
    phone_hash      TEXT,  -- bcrypt hash of phone number for verification
    role            user_role NOT NULL DEFAULT 'user',
    community_score INTEGER NOT NULL DEFAULT 0 CHECK (community_score >= 0),
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    is_suspended    BOOLEAN NOT NULL DEFAULT false,
    locale          TEXT NOT NULL DEFAULT 'ro' CHECK (locale IN ('ro', 'en')),
    last_active_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN users.auth_id IS 'References auth.users.id from Supabase Auth';
COMMENT ON COLUMN users.community_score IS 'Gamification score earned through successful matches and community participation';

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE posts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                    post_type NOT NULL,
    status                  post_status NOT NULL DEFAULT 'active',
    category                post_category NOT NULL,
    title                   TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
    description             TEXT CHECK (description IS NULL OR char_length(description) <= 2000),

    -- Geospatial
    location                GEOGRAPHY(Point, 4326) NOT NULL,
    location_name           TEXT,  -- Reverse-geocoded human-readable address
    route_geometry          GEOGRAPHY(LineString, 4326),  -- For route-based posts

    -- Reward
    reward_amount           DECIMAL(10, 2) CHECK (reward_amount IS NULL OR reward_amount >= 0),
    reward_currency         TEXT DEFAULT 'RON',
    contact_preference      contact_preference NOT NULL DEFAULT 'chat',

    -- AI metadata
    ai_category_suggestion  TEXT,
    ai_embedding            vector(512),  -- For similarity matching
    ai_labels               JSONB DEFAULT '[]'::jsonb,

    -- Engagement
    view_count              INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),

    -- Boost (monetization)
    is_boosted              BOOLEAN NOT NULL DEFAULT false,
    boost_expires_at        TIMESTAMPTZ,

    -- Lifecycle
    expires_at              TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    resolved_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE posts IS 'Lost and found item posts - the core content entity';
COMMENT ON COLUMN posts.location IS 'PostGIS geography point in WGS84 (SRID 4326)';
COMMENT ON COLUMN posts.ai_embedding IS '512-dim vector from CLIP/OpenAI for visual similarity matching';

-- ============================================================
-- POST IMAGES
-- ============================================================
CREATE TABLE post_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    storage_path    TEXT NOT NULL,  -- Path in Supabase Storage
    thumbnail_path  TEXT NOT NULL,
    original_url    TEXT NOT NULL,
    thumbnail_url   TEXT NOT NULL,
    ai_labels       JSONB DEFAULT '[]'::jsonb,
    ai_embedding    vector(512),
    display_order   SMALLINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE post_images IS 'Images attached to posts, with AI metadata';

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE matches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_post_id        UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    found_post_id       UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    confidence_score    DECIMAL(5, 4) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    match_factors       JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example: {"location": 0.85, "visual": 0.72, "category": 1.0, "time": 0.6, "text": 0.4}
    status              match_status NOT NULL DEFAULT 'pending',
    confirmed_by_lost   BOOLEAN NOT NULL DEFAULT false,
    confirmed_by_found  BOOLEAN NOT NULL DEFAULT false,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_match_pair UNIQUE (lost_post_id, found_post_id),
    CONSTRAINT chk_different_posts CHECK (lost_post_id != found_post_id)
);

COMMENT ON TABLE matches IS 'AI-generated match suggestions between lost and found posts';
COMMENT ON COLUMN matches.confidence_score IS 'Weighted composite score from 0.0 to 1.0';

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id        UUID REFERENCES matches(id) ON DELETE SET NULL,
    participant_ids UUID[] NOT NULL CHECK (array_length(participant_ids, 1) = 2),
    status          conversation_status NOT NULL DEFAULT 'active',
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE conversations IS 'Chat conversations between two users, optionally linked to a match';

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_encrypted   TEXT NOT NULL,  -- AES-256-GCM encrypted message body
    message_type        message_type NOT NULL DEFAULT 'text',
    is_read             BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE messages IS 'Encrypted chat messages within conversations';
COMMENT ON COLUMN messages.content_encrypted IS 'AES-256-GCM encrypted content, decrypted client-side';

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    data        JSONB DEFAULT '{}'::jsonb,  -- { postId, matchId, conversationId, etc. }
    is_read     BOOLEAN NOT NULL DEFAULT false,
    is_pushed   BOOLEAN NOT NULL DEFAULT false,  -- Whether push notification was sent
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS 'In-app and push notification records';

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type     target_type NOT NULL,
    target_id       UUID NOT NULL,  -- Polymorphic: references posts.id, users.id, or messages.id
    reason          report_reason NOT NULL,
    description     TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
    status          report_status NOT NULL DEFAULT 'pending',
    moderator_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_note TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at     TIMESTAMPTZ
);

COMMENT ON TABLE reports IS 'User-submitted reports for content moderation';

-- ============================================================
-- REWARDS
-- ============================================================
CREATE TABLE rewards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    offered_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claimed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    amount      DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency    TEXT NOT NULL DEFAULT 'RON',
    status      reward_status NOT NULL DEFAULT 'offered',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE rewards IS 'Reward offers attached to lost item posts';

-- ============================================================
-- USER DEVICE TOKENS (Push Notifications)
-- ============================================================
CREATE TABLE user_device_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL,
    platform    device_platform NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_user_device_token UNIQUE (user_id, token)
);

COMMENT ON TABLE user_device_tokens IS 'FCM/APNs device tokens for push notifications';

-- ============================================================
-- USER ALERT ZONES (Radius-based alerts)
-- ============================================================
CREATE TABLE user_alert_zones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    center          GEOGRAPHY(Point, 4326) NOT NULL,
    radius_meters   INTEGER NOT NULL DEFAULT 500 CHECK (radius_meters BETWEEN 100 AND 10000),
    categories      post_category[] DEFAULT ARRAY['pet', 'object', 'document', 'other']::post_category[],
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_alert_zones IS 'Geographic zones where users want to receive alerts for new posts';

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,  -- e.g., 'post.create', 'match.confirm', 'user.suspend'
    target_type TEXT NOT NULL,  -- e.g., 'post', 'user', 'match'
    target_id   UUID NOT NULL,
    metadata    JSONB DEFAULT '{}'::jsonb,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for security and compliance';
