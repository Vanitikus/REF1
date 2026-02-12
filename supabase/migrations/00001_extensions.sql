-- ============================================================
-- REFiND Platform - Database Migration 00001
-- Extensions and base setup
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUID generation
CREATE EXTENSION IF NOT EXISTS "postgis";          -- Geospatial queries
CREATE EXTENSION IF NOT EXISTS "vector";           -- pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Trigram similarity for text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Encryption functions

-- ============================================================
-- Custom ENUM types
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE post_type AS ENUM ('lost', 'found');
CREATE TYPE post_status AS ENUM ('active', 'resolved', 'expired', 'removed');
CREATE TYPE post_category AS ENUM ('pet', 'object', 'document', 'other');
CREATE TYPE contact_preference AS ENUM ('chat', 'phone', 'both');
CREATE TYPE match_status AS ENUM ('pending', 'confirmed', 'rejected', 'expired');
CREATE TYPE conversation_status AS ENUM ('active', 'closed', 'reported');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');
CREATE TYPE notification_type AS ENUM ('match', 'message', 'radius_alert', 'system', 'moderation');
CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'fraud', 'harassment', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE reward_status AS ENUM ('offered', 'claimed', 'paid', 'cancelled');
CREATE TYPE device_platform AS ENUM ('ios', 'android', 'web');
CREATE TYPE target_type AS ENUM ('post', 'user', 'message');
