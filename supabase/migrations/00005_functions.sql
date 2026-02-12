-- ============================================================
-- REFiND Platform - Database Migration 00005
-- Database functions and triggers
-- ============================================================

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_rewards_updated_at
    BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_device_tokens_updated_at
    BEFORE UPDATE ON user_device_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- MATCH CANDIDATES QUERY FUNCTION
-- Used by the matching engine to find potential matches
-- ============================================================
CREATE OR REPLACE FUNCTION find_match_candidates(
    p_post_id UUID,
    p_max_distance_meters DOUBLE PRECISION DEFAULT 10000,
    p_max_age_days INTEGER DEFAULT 14,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    candidate_id UUID,
    distance_meters DOUBLE PRECISION,
    time_diff_hours DOUBLE PRECISION,
    visual_similarity DOUBLE PRECISION,
    candidate_type post_type,
    candidate_category post_category
) AS $$
DECLARE
    v_post RECORD;
BEGIN
    -- Get the source post details
    SELECT
        p.id, p.type, p.category, p.location, p.ai_embedding, p.created_at
    INTO v_post
    FROM posts p
    WHERE p.id = p_post_id AND p.status = 'active';

    IF v_post IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        c.id AS candidate_id,
        ST_Distance(c.location, v_post.location) AS distance_meters,
        EXTRACT(EPOCH FROM abs(c.created_at - v_post.created_at)) / 3600.0 AS time_diff_hours,
        CASE
            WHEN v_post.ai_embedding IS NOT NULL AND c.ai_embedding IS NOT NULL
            THEN 1.0 - (v_post.ai_embedding <=> c.ai_embedding)
            ELSE 0.0
        END AS visual_similarity,
        c.type AS candidate_type,
        c.category AS candidate_category
    FROM posts c
    WHERE c.status = 'active'
        -- Opposite type (lost matches found, found matches lost)
        AND c.type != v_post.type
        -- Same category (hard filter)
        AND c.category = v_post.category
        -- Within max distance
        AND ST_DWithin(c.location, v_post.location, p_max_distance_meters)
        -- Within time window
        AND c.created_at > (now() - make_interval(days => p_max_age_days))
        -- Not the same post
        AND c.id != v_post.id
        -- No existing match between these posts
        AND NOT EXISTS (
            SELECT 1 FROM matches m
            WHERE (m.lost_post_id = v_post.id AND m.found_post_id = c.id)
               OR (m.lost_post_id = c.id AND m.found_post_id = v_post.id)
        )
    ORDER BY
        -- Priority: distance first, then visual similarity
        ST_Distance(c.location, v_post.location) ASC,
        CASE
            WHEN v_post.ai_embedding IS NOT NULL AND c.ai_embedding IS NOT NULL
            THEN v_post.ai_embedding <=> c.ai_embedding
            ELSE 1.0
        END ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GET POSTS AS GEOJSON (for map rendering)
-- ============================================================
CREATE OR REPLACE FUNCTION get_posts_geojson(
    p_bounds_sw_lng DOUBLE PRECISION DEFAULT -180,
    p_bounds_sw_lat DOUBLE PRECISION DEFAULT -90,
    p_bounds_ne_lng DOUBLE PRECISION DEFAULT 180,
    p_bounds_ne_lat DOUBLE PRECISION DEFAULT 90,
    p_type post_type DEFAULT NULL,
    p_category post_category DEFAULT NULL,
    p_limit INTEGER DEFAULT 500
)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(jsonb_agg(feature), '[]'::jsonb)
        )
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'id', p.id,
                'geometry', ST_AsGeoJSON(p.location::geometry)::jsonb,
                'properties', jsonb_build_object(
                    'id', p.id,
                    'type', p.type,
                    'category', p.category,
                    'title', p.title,
                    'status', p.status,
                    'reward_amount', p.reward_amount,
                    'is_boosted', p.is_boosted,
                    'created_at', p.created_at,
                    'thumbnail_url', (
                        SELECT pi.thumbnail_url
                        FROM post_images pi
                        WHERE pi.post_id = p.id
                        ORDER BY pi.display_order ASC
                        LIMIT 1
                    )
                )
            ) AS feature
            FROM posts p
            WHERE p.status = 'active'
                AND ST_Intersects(
                    p.location,
                    ST_MakeEnvelope(
                        p_bounds_sw_lng, p_bounds_sw_lat,
                        p_bounds_ne_lng, p_bounds_ne_lat,
                        4326
                    )::geography
                )
                AND (p_type IS NULL OR p.type = p_type)
                AND (p_category IS NULL OR p.category = p_category)
            ORDER BY
                p.is_boosted DESC,
                p.created_at DESC
            LIMIT p_limit
        ) sub
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HEAT ZONE DATA
-- ============================================================
CREATE OR REPLACE FUNCTION get_heat_zones(
    p_days INTEGER DEFAULT 30,
    p_min_count INTEGER DEFAULT 3
)
RETURNS TABLE (
    lng DOUBLE PRECISION,
    lat DOUBLE PRECISION,
    intensity INTEGER,
    lost_count BIGINT,
    found_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ST_X(ST_SnapToGrid(p.location::geometry, 0.002)) AS lng,
        ST_Y(ST_SnapToGrid(p.location::geometry, 0.002)) AS lat,
        COUNT(*)::INTEGER AS intensity,
        COUNT(*) FILTER (WHERE p.type = 'lost') AS lost_count,
        COUNT(*) FILTER (WHERE p.type = 'found') AS found_count
    FROM posts p
    WHERE p.status = 'active'
        AND p.created_at > (now() - make_interval(days => p_days))
    GROUP BY
        ST_X(ST_SnapToGrid(p.location::geometry, 0.002)),
        ST_Y(ST_SnapToGrid(p.location::geometry, 0.002))
    HAVING COUNT(*) >= p_min_count
    ORDER BY intensity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RADIUS ALERT CHECK
-- When a new post is created, find users who should be alerted
-- ============================================================
CREATE OR REPLACE FUNCTION check_radius_alerts()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT
        az.user_id,
        'radius_alert'::notification_type,
        CASE NEW.type
            WHEN 'lost' THEN 'New lost item nearby'
            WHEN 'found' THEN 'New found item nearby'
        END,
        NEW.title || ' - ' || COALESCE(NEW.location_name, 'Near you'),
        jsonb_build_object(
            'post_id', NEW.id,
            'post_type', NEW.type,
            'category', NEW.category,
            'distance_meters', ST_Distance(NEW.location, az.center)
        )
    FROM user_alert_zones az
    WHERE az.is_active = true
        AND az.user_id != NEW.user_id  -- Don't alert the post creator
        AND ST_DWithin(NEW.location, az.center, az.radius_meters)
        AND (NEW.category = ANY(az.categories));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_radius_alerts
    AFTER INSERT ON posts
    FOR EACH ROW
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION check_radius_alerts();

-- ============================================================
-- UPDATE COMMUNITY SCORE
-- ============================================================
CREATE OR REPLACE FUNCTION update_community_score()
RETURNS TRIGGER AS $$
BEGIN
    -- When a match is confirmed by both parties
    IF NEW.confirmed_by_lost = true AND NEW.confirmed_by_found = true AND NEW.status = 'confirmed' THEN
        -- Award points to both post owners
        UPDATE users SET community_score = community_score + 10
        WHERE id IN (
            SELECT user_id FROM posts WHERE id = NEW.lost_post_id
            UNION
            SELECT user_id FROM posts WHERE id = NEW.found_post_id
        );

        -- Mark both posts as resolved
        UPDATE posts SET status = 'resolved', resolved_at = now()
        WHERE id IN (NEW.lost_post_id, NEW.found_post_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_match_confirmed
    AFTER UPDATE ON matches
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed')
    EXECUTE FUNCTION update_community_score();

-- ============================================================
-- AUTO-EXPIRE POSTS
-- Run via pg_cron daily
-- ============================================================
CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    WITH expired AS (
        UPDATE posts
        SET status = 'expired', updated_at = now()
        WHERE status = 'active' AND expires_at < now()
        RETURNING id
    )
    SELECT count(*) INTO v_count FROM expired;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CONVERSATION LAST MESSAGE UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_message_update_conversation
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();
