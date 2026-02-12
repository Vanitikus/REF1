# REFiND Platform Architecture

> "The Waze of Lost & Found" — A civic-tech, mobile-first platform for posting,
> discovering, matching, and recovering lost or found objects, pets, and documents.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Database Schema](#2-database-schema)
3. [User Flows](#3-user-flows)
4. [Matching Logic](#4-matching-logic)
5. [Map Engine Design](#5-map-engine-design)
6. [AI Integration Plan](#6-ai-integration-plan)
7. [Security & RLS Model](#7-security--rls-model)
8. [UX Component System](#8-ux-component-system)
9. [Scalability Roadmap](#9-scalability-roadmap)
10. [Technical Risks & Mitigation](#10-technical-risks--mitigation)

---

## 1. System Architecture

### 1.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ React Native │  │   Next.js    │  │   Admin Dashboard        │  │
│  │  Mobile App  │  │   Web App    │  │   (Next.js + React)      │  │
│  │  (iOS/Android)│  │  (PWA-ready) │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                  │                        │                │
└─────────┼──────────────────┼────────────────────────┼────────────────┘
          │                  │                        │
          ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / EDGE                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Supabase Edge Functions + Custom Node.js API (Fastify)     │   │
│  │  • Rate Limiting  • Auth Middleware  • Request Validation    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                  │                        │
          ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                   │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │   Auth     │ │   Posts    │ │   Match    │ │  Notification  │   │
│  │  Service   │ │  Service   │ │  Engine    │ │   Service      │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘   │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │   Chat     │ │    Map     │ │    AI      │ │   Moderation   │   │
│  │  Service   │ │  Service   │ │  Service   │ │   Service      │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                  │                        │
          ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                     │
│                                                                     │
│  ┌──────────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │   PostgreSQL     │  │    Redis      │  │   Object Storage   │   │
│  │   (Supabase)     │  │   (Upstash)   │  │   (Supabase S3)   │   │
│  │   + PostGIS      │  │   • Cache     │  │   • Images         │   │
│  │   + pgvector     │  │   • Sessions  │  │   • Thumbnails     │   │
│  │                  │  │   • Queues    │  │   • AI Embeddings  │   │
│  └──────────────────┘  └───────────────┘  └────────────────────┘   │
│                                                                     │
│  ┌──────────────────┐  ┌───────────────────────────────────────┐   │
│  │   Supabase       │  │   External Services                   │   │
│  │   Realtime       │  │   • Google Cloud Vision / OpenAI      │   │
│  │   (WebSocket)    │  │   • Mapbox / Google Maps Platform     │   │
│  │                  │  │   • Firebase Cloud Messaging          │   │
│  │                  │  │   • SendGrid (transactional email)    │   │
│  └──────────────────┘  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKGROUND JOBS                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │  Match     │ │  Image     │ │  Cleanup   │ │  Analytics     │   │
│  │  Scanner   │ │ Processing │ │   Jobs     │ │  Aggregator    │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘   │
│                                                                     │
│  Powered by: pg_cron + Supabase Edge Functions + BullMQ (Redis)    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile** | React Native (Expo SDK 52+) | Cross-platform, OTA updates, large ecosystem |
| **Web** | Next.js 15 (App Router) | SSR/SSG, admin dashboard, SEO for public listings |
| **API** | Fastify 5 + TypeScript | High performance, schema validation, plugin system |
| **Database** | PostgreSQL 16 (Supabase) | PostGIS for geo, pgvector for AI embeddings, RLS |
| **Cache** | Redis (Upstash) | Serverless Redis, geo-commands, pub/sub |
| **Realtime** | Supabase Realtime | WebSocket channels, presence, database changes |
| **Auth** | Supabase Auth | JWT, social logins, MFA-ready, session management |
| **Storage** | Supabase Storage | S3-compatible, image transforms, CDN |
| **AI** | OpenAI Vision + custom models | Image classification, similarity, embeddings |
| **Maps** | Mapbox GL JS / React Native | Custom styling, clustering, offline support |
| **Push** | Firebase Cloud Messaging | Cross-platform, topic-based, reliable delivery |
| **Email** | SendGrid | Transactional, templates, deliverability |
| **Jobs** | BullMQ + Redis | Reliable queues, retries, rate limiting |
| **Monitoring** | Sentry + PostHog | Error tracking, product analytics |
| **CI/CD** | GitHub Actions | Automated testing, preview deploys |

### 1.3 Deployment Architecture

```
                    ┌───────────────────┐
                    │   Cloudflare CDN  │
                    │   + WAF + DDoS    │
                    └────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │  Vercel    │  │  Supabase  │  │  Railway   │
     │  (Web +   │  │  (DB +     │  │  (API +    │
     │  Admin)    │  │  Auth +    │  │  Workers)  │
     │            │  │  Storage + │  │            │
     │            │  │  Realtime) │  │            │
     └────────────┘  └────────────┘  └────────────┘
```

**Why this split:**
- **Vercel**: Optimal for Next.js with edge functions, preview deploys
- **Supabase**: Managed Postgres with built-in auth, storage, and realtime
- **Railway**: Persistent Node.js processes for background jobs and custom API

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Users   │────<│  Posts    │>────│ Locations│
└──────────┘     └──────────┘     └──────────┘
     │                │ │
     │                │ └────────────<┌──────────┐
     │                │               │ Matches  │
     │                │ ┌────────────>└──────────┘
     │                │ │
     │           ┌──────────┐     ┌──────────────┐
     │           │  Images  │     │ Notifications │
     │           └──────────┘     └──────────────┘
     │                                    │
     │  ┌──────────┐  ┌──────────┐       │
     ├─<│ Messages │  │ Reports  │<──────┘
     │  └──────────┘  └──────────┘
     │
     │  ┌──────────┐  ┌──────────────┐
     ├─<│ Rewards  │  │ AuditLogs    │
     │  └──────────┘  └──────────────┘
     │
     │  ┌──────────────────┐
     └─<│ UserDeviceTokens │
        └──────────────────┘
```

### 2.2 Complete Table Definitions

See `supabase/migrations/` for full SQL. Summary below:

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| auth_id | UUID | UNIQUE, NOT NULL, FK → auth.users |
| email | TEXT | UNIQUE, NOT NULL |
| display_name | TEXT | NOT NULL, 2-50 chars |
| avatar_url | TEXT | nullable |
| phone_hash | TEXT | nullable, hashed |
| role | ENUM('user','moderator','admin') | DEFAULT 'user' |
| community_score | INTEGER | DEFAULT 0, CHECK >= 0 |
| is_verified | BOOLEAN | DEFAULT false |
| is_suspended | BOOLEAN | DEFAULT false |
| locale | TEXT | DEFAULT 'ro' |
| last_active_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### `posts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| type | ENUM('lost','found') | NOT NULL |
| status | ENUM('active','resolved','expired','removed') | DEFAULT 'active' |
| category | ENUM('pet','object','document','other') | NOT NULL |
| title | TEXT | NOT NULL, 5-200 chars |
| description | TEXT | nullable, max 2000 chars |
| location | GEOGRAPHY(Point, 4326) | NOT NULL |
| location_name | TEXT | reverse-geocoded address |
| route_geometry | GEOGRAPHY(LineString, 4326) | nullable, for route posts |
| reward_amount | DECIMAL(10,2) | nullable, CHECK >= 0 |
| reward_currency | TEXT | DEFAULT 'RON' |
| contact_preference | ENUM('chat','phone','both') | DEFAULT 'chat' |
| ai_category_suggestion | TEXT | from AI classification |
| ai_embedding | vector(512) | for similarity matching |
| ai_labels | JSONB | AI-detected labels |
| view_count | INTEGER | DEFAULT 0 |
| is_boosted | BOOLEAN | DEFAULT false |
| boost_expires_at | TIMESTAMPTZ | nullable |
| expires_at | TIMESTAMPTZ | DEFAULT now() + 30 days |
| resolved_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### `post_images`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| post_id | UUID | FK → posts, NOT NULL |
| storage_path | TEXT | NOT NULL |
| thumbnail_path | TEXT | NOT NULL |
| original_url | TEXT | NOT NULL |
| thumbnail_url | TEXT | NOT NULL |
| ai_labels | JSONB | detected objects/features |
| ai_embedding | vector(512) | image embedding for matching |
| display_order | SMALLINT | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### `matches`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| lost_post_id | UUID | FK → posts, NOT NULL |
| found_post_id | UUID | FK → posts, NOT NULL |
| confidence_score | DECIMAL(5,4) | 0.0000 to 1.0000 |
| match_factors | JSONB | { location: 0.8, visual: 0.7, ... } |
| status | ENUM('pending','confirmed','rejected','expired') | DEFAULT 'pending' |
| confirmed_by_lost | BOOLEAN | DEFAULT false |
| confirmed_by_found | BOOLEAN | DEFAULT false |
| resolved_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

**UNIQUE constraint:** (lost_post_id, found_post_id)

#### `conversations`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| match_id | UUID | FK → matches, nullable |
| participant_ids | UUID[] | array of user IDs |
| status | ENUM('active','closed','reported') | DEFAULT 'active' |
| last_message_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### `messages`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| conversation_id | UUID | FK → conversations, NOT NULL |
| sender_id | UUID | FK → users, NOT NULL |
| content_encrypted | TEXT | AES-256 encrypted body |
| message_type | ENUM('text','image','system') | DEFAULT 'text' |
| is_read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### `notifications`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| type | ENUM('match','message','radius_alert','system','moderation') | NOT NULL |
| title | TEXT | NOT NULL |
| body | TEXT | NOT NULL |
| data | JSONB | { postId, matchId, ... } |
| is_read | BOOLEAN | DEFAULT false |
| is_pushed | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### `reports`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| reporter_id | UUID | FK → users, NOT NULL |
| target_type | ENUM('post','user','message') | NOT NULL |
| target_id | UUID | NOT NULL |
| reason | ENUM('spam','inappropriate','fraud','harassment','other') | NOT NULL |
| description | TEXT | nullable, max 1000 chars |
| status | ENUM('pending','reviewing','resolved','dismissed') | DEFAULT 'pending' |
| moderator_id | UUID | FK → users, nullable |
| resolution_note | TEXT | nullable |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| resolved_at | TIMESTAMPTZ | nullable |

#### `rewards`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| post_id | UUID | FK → posts, NOT NULL |
| offered_by | UUID | FK → users, NOT NULL |
| claimed_by | UUID | FK → users, nullable |
| amount | DECIMAL(10,2) | NOT NULL |
| currency | TEXT | DEFAULT 'RON' |
| status | ENUM('offered','claimed','paid','cancelled') | DEFAULT 'offered' |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### `user_device_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| token | TEXT | NOT NULL |
| platform | ENUM('ios','android','web') | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

**UNIQUE constraint:** (user_id, token)

#### `user_alert_zones`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| center | GEOGRAPHY(Point, 4326) | NOT NULL |
| radius_meters | INTEGER | DEFAULT 500, CHECK 100-10000 |
| categories | TEXT[] | filter categories |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### `audit_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| actor_id | UUID | FK → users, nullable |
| action | TEXT | NOT NULL |
| target_type | TEXT | NOT NULL |
| target_id | UUID | NOT NULL |
| metadata | JSONB | |
| ip_address | INET | nullable |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### 2.3 Indexing Strategy

```sql
-- Geospatial (critical for map queries and radius matching)
CREATE INDEX idx_posts_location ON posts USING GIST (location);
CREATE INDEX idx_posts_route ON posts USING GIST (route_geometry);
CREATE INDEX idx_alert_zones_center ON user_alert_zones USING GIST (center);

-- Vector similarity (AI matching)
CREATE INDEX idx_posts_embedding ON posts USING ivfflat (ai_embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX idx_images_embedding ON post_images USING ivfflat (ai_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Composite for feed queries
CREATE INDEX idx_posts_active_feed ON posts (status, created_at DESC)
  WHERE status = 'active';
CREATE INDEX idx_posts_type_category ON posts (type, category, status)
  WHERE status = 'active';
CREATE INDEX idx_posts_user ON posts (user_id, created_at DESC);

-- Time-based filtering
CREATE INDEX idx_posts_created ON posts (created_at DESC);
CREATE INDEX idx_posts_expires ON posts (expires_at) WHERE status = 'active';

-- Chat performance
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_conversations_participants ON conversations USING GIN (participant_ids);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, created_at DESC)
  WHERE is_read = false;

-- Matching
CREATE INDEX idx_matches_posts ON matches (lost_post_id, found_post_id);
CREATE INDEX idx_matches_status ON matches (status) WHERE status = 'pending';

-- Audit (append-only, partition by month)
CREATE INDEX idx_audit_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_target ON audit_logs (target_type, target_id, created_at DESC);
```

---

## 3. User Flows

### 3.1 Onboarding Flow

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ Splash  │────>│  Auth    │────>│  Location  │────>│  Home    │
│ Screen  │     │  Screen  │     │ Permission │     │  (Map)   │
└─────────┘     └──────────┘     └────────────┘     └──────────┘
                     │
              ┌──────┴──────┐
              ▼              ▼
        ┌──────────┐  ┌──────────┐
        │  Email   │  │  Social  │
        │  Login   │  │  Login   │
        └──────────┘  └──────────┘
```

### 3.2 Post Creation Flow (3-Step Ultra-Fast)

```
Step 1                   Step 2                   Step 3
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   📷 Camera     │     │  Select Category │     │   Pin Location   │
│                  │     │                  │     │                  │
│  ┌────────────┐  │     │  🐾 Pet          │     │  [====MAP====]   │
│  │            │  │     │  📦 Object       │     │       📍         │
│  │   Photo    │  │     │  📄 Document     │     │                  │
│  │   Preview  │  │     │  🔷 Other        │     │  ┌────────────┐  │
│  │            │  │     │                  │     │  │  Address   │  │
│  └────────────┘  │     │  Lost ◉  Found ○ │     │  │  Preview   │  │
│                  │     │                  │     │  └────────────┘  │
│  [Take Photo]    │     │                  │     │                  │
│  [From Gallery]  │     │  AI suggests:    │     │  [PUBLISH NOW]   │
│                  │     │  "Dog - Golden"  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │                        │                        │
         │    AI processes        │   Category set         │  Post created
         │    image in bg         │                        │  Matching starts
         ▼                        ▼                        ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                    OPTIONAL DETAILS                          │
   │  • Description  • Reward  • Contact pref  • Route trace     │
   └──────────────────────────────────────────────────────────────┘
```

### 3.3 Discovery Flow

```
┌─────────────────────────────────────────────┐
│              HOME SCREEN                     │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │           MAP VIEW                   │    │
│  │     🔴    🟢                         │    │
│  │        🔴       🟢                   │    │
│  │  🔵        🔴                        │    │
│  │     🟢          🔴                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Filter: All | Lost | Found | Pets | Docs] │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  FEED (scrollable cards)            │    │
│  │  ┌───────────────────────────┐      │    │
│  │  │ 🔴 Lost Dog - Golden     │      │    │
│  │  │ 📍 Parcul Herăstrău, 2h  │      │    │
│  │  │ 💰 Reward: 200 RON       │      │    │
│  │  └───────────────────────────┘      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ═══════════════════════════════════════     │
│  🗺️ Map  📋 Feed  ➕ Post  🔔 Alerts  👤   │
└─────────────────────────────────────────────┘
```

### 3.4 Match Resolution Flow

```
User A posts "Lost Dog"          User B posts "Found Dog"
        │                                  │
        └──────────┐    ┌─────────────────┘
                   ▼    ▼
            ┌──────────────────┐
            │  MATCHING ENGINE │
            │  Score: 0.87     │
            └────────┬─────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   Notification A          Notification B
   "Possible match!"       "Possible match!"
         │                       │
         ▼                       ▼
   ┌────────────┐         ┌────────────┐
   │ Match Card │         │ Match Card │
   │ [View]     │         │ [View]     │
   │ [Dismiss]  │         │ [Dismiss]  │
   └────────────┘         └────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
              ┌────────────┐
              │  In-App    │
              │  Chat      │
              │  Opens     │
              └──────┬─────┘
                     ▼
              ┌────────────┐
              │  Both      │
              │  Confirm   │
              │  Match     │
              └──────┬─────┘
                     ▼
              ┌────────────┐
              │  RESOLVED  │
              │  +Score    │
              │  +Stats    │
              └────────────┘
```

---

## 4. Matching Logic

### 4.1 Multi-Signal Scoring Engine

The matching engine combines multiple signals with configurable weights:

```
MATCH_SCORE = (
    W_location  × location_score  +
    W_visual    × visual_score    +
    W_category  × category_score  +
    W_time      × time_score      +
    W_text      × text_score
) / (W_location + W_visual + W_category + W_time + W_text)
```

**Default Weights:**
| Signal | Weight | Description |
|--------|--------|-------------|
| Location proximity | 0.30 | Distance between lost/found locations |
| Visual similarity | 0.30 | AI embedding cosine similarity |
| Category match | 0.20 | Exact category match is required |
| Time proximity | 0.10 | Closer in time → higher score |
| Text similarity | 0.10 | Description keyword overlap |

### 4.2 Scoring Functions

**Location Score:**
```
location_score(d) =
  1.0              if d < 200m
  1.0 - (d-200)/4800  if 200m ≤ d < 5km
  0.0              if d ≥ 5km
```
Uses PostGIS `ST_Distance` with geography type for accurate meter-based distance.

**Visual Similarity Score:**
```
visual_score = 1 - cosine_distance(embedding_a, embedding_b)
```
Uses pgvector `<=>` operator for cosine distance.

**Time Score:**
```
time_score(h) =
  1.0              if h < 1 hour
  1.0 - (h-1)/167   if 1h ≤ h < 168h (1 week)
  0.0              if h ≥ 168h
```

**Category Score:**
```
category_score = 1.0 if exact match, 0.0 otherwise
```
Category match is a hard filter — no cross-category matches.

### 4.3 Match Pipeline

```
1. NEW POST arrives (type = 'lost' or 'found')
         │
         ▼
2. CANDIDATE FILTER (fast, SQL-based)
   - Opposite type (lost ↔ found)
   - Same category
   - Within 10km radius (PostGIS)
   - Created within 14 days
   - Status = 'active'
   - No existing match between these posts
         │
         ▼
3. SCORING (for each candidate)
   - Compute location_score
   - Compute visual_score (pgvector cosine)
   - Compute time_score
   - Compute text_score (ts_rank)
   - Weighted combination
         │
         ▼
4. THRESHOLD FILTER
   - confidence_score ≥ 0.45 → create match record
   - confidence_score ≥ 0.70 → high-confidence notification
   - confidence_score ≥ 0.85 → urgent notification + badge
         │
         ▼
5. NOTIFICATION DISPATCH
   - Push notification to both users
   - In-app match card
   - Email digest (if push not delivered)
```

### 4.4 Optimization Strategy

- **Spatial pre-filter**: PostGIS bounding box index eliminates >95% of candidates
- **Batch processing**: New posts are matched via background job (< 2s latency)
- **Embedding cache**: AI embeddings stored on post creation, never recomputed
- **IVFFlat index**: Approximate nearest neighbor for vector similarity at scale
- **Result capping**: Max 20 candidates per match run (sorted by combined score)

---

## 5. Map Engine Design

### 5.1 Technology Choice: Mapbox GL

**Why Mapbox over Google Maps:**
- Custom map styling aligned with REFiND brand
- Better clustering API out of the box
- More affordable at scale (tile-based pricing)
- Offline map support for future features
- First-class React Native support via `@rnmapbox/maps`

### 5.2 Pin System

```
PIN TYPES:
┌─────────────────────────────────────────┐
│  🔴 LOST    - Red pin (#FF6B6B)         │
│  🟢 FOUND   - Green pin (#51CF66)       │
│  🔵 UPDATE  - Blue pin (#339AF0)        │
│  ⭐ REWARD  - Gold badge overlay        │
│  🔥 HOT     - Animated pulse (3+ posts) │
└─────────────────────────────────────────┘
```

### 5.3 Clustering Logic

```
Zoom Level    Behavior
──────────    ────────
0-8           Country/region clusters (count badges)
9-12          City-level clusters (category breakdown)
13-15         Individual pins visible
16+           Full detail + route lines visible
```

Clustering uses Supercluster (JS library) for client-side performance:
- Server provides GeoJSON feature collection
- Client handles clustering/unclustering
- Cluster tap → zoom to expand
- Individual pin tap → post detail sheet

### 5.4 Heat Zone Visualization

Heat zones highlight areas with high lost/found activity:

```sql
-- Generate heat zone data
SELECT
  ST_SnapToGrid(location::geometry, 0.001) as cell,
  COUNT(*) as intensity,
  jsonb_build_object(
    'lost', COUNT(*) FILTER (WHERE type = 'lost'),
    'found', COUNT(*) FILTER (WHERE type = 'found')
  ) as breakdown
FROM posts
WHERE status = 'active'
  AND created_at > now() - interval '30 days'
GROUP BY cell
HAVING COUNT(*) >= 3;
```

Rendered as a Mapbox heatmap layer with:
- Intensity mapped to post density
- Color gradient: Yellow → Orange → Red
- Toggled via UI control
- Updates every 15 minutes (cached in Redis)

### 5.5 Route Reconstruction

For users who walked a path and lost an item:

```
User draws route on map
         │
         ▼
System generates LineString geometry
         │
         ▼
Buffer zone created (50m each side)
         │
         ▼
Found items within buffer are highlighted
         │
         ▼
AI suggests "Most likely drop point" based on:
  - Direction of travel
  - Time estimates
  - Historical loss patterns
```

### 5.6 "Scan Mode" (Camera AR View)

Future feature using device camera + GPS:
- Overlay found item pins on camera view
- Distance indicators
- "Walk towards" directional arrows
- Uses device compass + accelerometer

---

## 6. AI Integration Plan

### 6.1 AI Service Architecture

```
┌─────────────────────────────────────────────┐
│              AI SERVICE LAYER               │
│                                             │
│  ┌───────────┐  ┌───────────┐              │
│  │  Image    │  │ Embedding │              │
│  │  Classify │  │ Generator │              │
│  └─────┬─────┘  └─────┬─────┘              │
│        │               │                    │
│  ┌─────┴─────┐  ┌─────┴─────┐              │
│  │  Content  │  │ Similarity│              │
│  │  Moderate │  │  Search   │              │
│  └─────┬─────┘  └─────┬─────┘              │
│        │               │                    │
│        ▼               ▼                    │
│  ┌──────────────────────────────┐           │
│  │      AI Gateway / Router    │           │
│  │  • Rate limiting            │           │
│  │  • Cost tracking            │           │
│  │  • Fallback routing         │           │
│  │  • Response caching         │           │
│  └──────────────────────────────┘           │
│        │               │                    │
│        ▼               ▼                    │
│  ┌───────────┐  ┌───────────┐              │
│  │  OpenAI   │  │  Google   │              │
│  │  Vision   │  │  Vision   │              │
│  │ (Primary) │  │(Fallback) │              │
│  └───────────┘  └───────────┘              │
└─────────────────────────────────────────────┘
```

### 6.2 AI Modules

#### Module 1: Image Classification
- **Input**: User-uploaded image
- **Output**: Category suggestion + labels
- **Model**: OpenAI GPT-4o Vision
- **Prompt**: Structured prompt requesting: object type, breed (if pet), color, condition, distinguishing features
- **Caching**: Results cached by image hash (SHA-256)

#### Module 2: Embedding Generation
- **Input**: Image + text description
- **Output**: 512-dimensional vector
- **Model**: OpenAI `text-embedding-3-small` for text, CLIP for images
- **Storage**: pgvector column on posts and post_images tables
- **Usage**: Similarity matching between lost/found items

#### Module 3: Content Moderation
- **Input**: Image + text
- **Output**: Safety flags (nsfw, violence, spam, PII)
- **Model**: OpenAI Moderation API + custom rules
- **Action**: Auto-flag for review if score > threshold

#### Module 4: Duplicate Detection
- **Input**: New post embedding
- **Output**: List of near-duplicate posts
- **Logic**: Cosine similarity > 0.95 from same user within 24h → flag as duplicate
- **Purpose**: Prevent spam and accidental double-posts

#### Module 5: Smart Suggestions
- **Input**: Image + location + time
- **Output**: Suggested title, description, category
- **UX**: Pre-fills post form, user can edit/accept

### 6.3 Cost Control Strategy

| Control | Implementation |
|---------|---------------|
| **Request caching** | Cache AI responses by image hash, 24h TTL |
| **Batch processing** | Queue non-urgent AI tasks, process in batches |
| **Model tiering** | Use cheaper models for classification, premium for matching |
| **Rate limiting** | Max 10 AI requests per user per hour |
| **Lazy embedding** | Generate embeddings only when match candidates exist |
| **Budget alerts** | Daily spend cap with automatic degradation |
| **Local fallback** | On-device CLIP model for basic classification (future) |

### 6.4 AI Cost Estimates (MVP)

| Operation | Cost/request | Monthly (10K users) |
|-----------|-------------|---------------------|
| Image classification | ~$0.003 | ~$90 |
| Embedding generation | ~$0.0001 | ~$3 |
| Content moderation | ~$0.001 | ~$30 |
| Text embedding | ~$0.00002 | ~$0.60 |
| **Total estimated** | | **~$125/month** |

---

## 7. Security & RLS Model

### 7.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────>│ Supabase │────>│  Custom  │
│          │     │  Auth    │     │   API    │
│          │<────│  (JWT)   │<────│  Layer   │
└──────────┘     └──────────┘     └──────────┘
     │                │
     │           JWT Token
     │           contains:
     │           - user.id
     │           - user.role
     │           - user.email
     ▼
  All subsequent
  requests include
  JWT in header
```

### 7.2 Row Level Security Policies

```sql
-- POSTS: Anyone can read active posts, only owner can modify
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_active" ON posts
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "posts_delete_admin" ON posts
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- MESSAGES: Only conversation participants can read
CREATE POLICY "messages_participant_only" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND auth.uid() = ANY(participant_ids)
    )
  );

-- USERS: Public profile data readable, private data restricted
CREATE POLICY "users_public_read" ON users
  FOR SELECT USING (true);
  -- Note: sensitive columns excluded via view/column permissions

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

### 7.3 API Security Layers

```
REQUEST → CloudFlare WAF
       → Rate Limiter (100 req/min per IP, 1000 req/min per user)
       → JWT Validation
       → Role-Based Access Check
       → Input Validation (Zod schemas)
       → Parameterized Queries (SQL injection prevention)
       → Response Sanitization
       → Audit Logging
```

### 7.4 Security Checklist

| Category | Measure | Status |
|----------|---------|--------|
| **Auth** | JWT with short expiry (1h) + refresh tokens | ✅ |
| **Auth** | Social login via Supabase (OAuth 2.0 PKCE) | ✅ |
| **Auth** | MFA support (TOTP) ready | 🔲 Phase 2 |
| **Data** | RLS on all tables | ✅ |
| **Data** | Encrypted chat messages (AES-256-GCM) | ✅ |
| **Data** | PII hashing (phone numbers) | ✅ |
| **Data** | GDPR: data export + deletion endpoints | ✅ |
| **API** | Rate limiting per IP and per user | ✅ |
| **API** | Input validation with Zod schemas | ✅ |
| **API** | Parameterized queries only | ✅ |
| **API** | CORS restricted to known origins | ✅ |
| **Upload** | Image type validation (magic bytes) | ✅ |
| **Upload** | File size limits (10MB) | ✅ |
| **Upload** | EXIF stripping (privacy) | ✅ |
| **Infra** | Environment secrets in vault (not .env) | ✅ |
| **Infra** | Database backups (daily, 30-day retention) | ✅ |
| **Infra** | Dependency scanning (Snyk/Dependabot) | ✅ |
| **Moderation** | AI content screening | ✅ |
| **Moderation** | User report system | ✅ |
| **Moderation** | Admin moderation dashboard | ✅ |

---

## 8. UX Component System

### 8.1 Design Tokens

```typescript
const theme = {
  colors: {
    primary: {
      50:  '#E6F7F5',
      100: '#B3EBE4',
      200: '#80DFD3',
      300: '#4DD3C2',
      400: '#26C9B5',
      500: '#0D9488',  // Deep Teal (Primary)
      600: '#0B7A70',
      700: '#086058',
      800: '#054640',
      900: '#032C28',
    },
    alert: {
      400: '#FF8A80',
      500: '#FF6B6B',  // Warm Coral (Alert)
      600: '#FA5252',
    },
    success: {
      400: '#69DB7C',
      500: '#51CF66',  // Emerald (Success)
      600: '#40C057',
    },
    neutral: {
      0:   '#FFFFFF',
      50:  '#F8F9FA',
      100: '#F1F3F5',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#868E96',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
    semantic: {
      lost:   '#FF6B6B',
      found:  '#51CF66',
      update: '#339AF0',
      reward: '#FFD43B',
    },
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  borderRadius: {
    sm: 8, md: 12, lg: 16, xl: 24, full: 9999,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
    caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
    label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  },
  shadows: {
    sm: { elevation: 2, shadowColor: '#000', shadowOpacity: 0.08 },
    md: { elevation: 4, shadowColor: '#000', shadowOpacity: 0.12 },
    lg: { elevation: 8, shadowColor: '#000', shadowOpacity: 0.16 },
  },
};
```

### 8.2 Core Components

```
NAVIGATION
├── BottomTabBar (Map / Feed / Post / Alerts / Profile)
├── HeaderBar (title, back, action)
└── FloatingActionButton (Post shortcut)

CARDS
├── PostCard (image, title, location, time, reward badge)
├── MatchCard (side-by-side comparison, confidence %)
├── AlertCard (notification item)
└── ProfileCard (avatar, name, score, stats)

MAP
├── MapView (Mapbox container)
├── ClusterMarker (count badge, category breakdown)
├── PinMarker (colored, animated)
├── HeatLayer (density visualization)
├── RouteOverlay (path line + buffer zone)
└── FilterBar (category toggles)

FORMS
├── ImagePicker (camera + gallery, preview)
├── CategorySelector (icon grid, single select)
├── LocationPicker (map + search, pin drop)
├── TextInput (labeled, validated, error state)
└── RewardInput (amount + currency)

FEEDBACK
├── Toast (success, error, info)
├── EmptyState (illustration + message + CTA)
├── LoadingShimmer (skeleton screens)
├── PullToRefresh
└── MicroAnimation (Lottie for match celebrations)

MODALS
├── BottomSheet (detail views, actions)
├── ConfirmDialog (destructive actions)
├── ImageViewer (pinch zoom, gallery)
└── ChatBubble (text, image, system message)
```

### 8.3 Bottom Navigation

```
┌────────────────────────────────────────────┐
│                                            │
│  🗺️         📋         ➕        🔔    👤   │
│  Map       Feed      Post     Alerts  Me  │
│                                            │
│  ─── active indicator (teal underline) ──  │
└────────────────────────────────────────────┘

- Post button is elevated (FAB style within tab bar)
- Alerts shows unread count badge
- Active state: filled icon + teal color
- Inactive state: outline icon + grey
```

### 8.4 Accessibility

- All interactive elements have minimum 44x44pt touch targets
- Color contrast ratios ≥ 4.5:1 (WCAG AA)
- Screen reader labels on all icons and images
- Reduced motion mode (disable animations)
- Dynamic type support (iOS) and font scaling (Android)
- Safe area insets (notch, home indicator)

### 8.5 Localization

- Romanian (ro) as default locale
- English (en) as secondary
- All strings externalized to i18n JSON files
- RTL-ready layout (for future Arabic/Hebrew)
- Date/time/currency formatted per locale
- Pluralization rules per language

---

## 9. Scalability Roadmap

### Phase 1: Local City Beta (0-10K users)

**Infrastructure:**
- Supabase free/pro tier
- Single Railway service
- Vercel hobby/pro
- Estimated cost: $50-150/month

**Focus:**
- Core functionality validation
- User feedback loops
- Match quality tuning
- Community building in one city (e.g., Bucharest)

### Phase 2: National Expansion (10K-100K users)

**Infrastructure scaling:**
- Supabase Pro with read replicas
- Redis cluster (Upstash Pro)
- CDN for image delivery
- Background job workers (2-3 instances)
- Estimated cost: $500-1,500/month

**New features:**
- Verified badge system
- Moderator recruitment tools
- City-specific landing pages
- Push notification optimization

### Phase 3: Hardware Integration (100K-500K users)

**Product:**
- QR/NFC smart tags for pets and valuables
- Tag → instant owner notification when scanned
- Tag management in user profile
- Retail partnership for tag distribution

**Infrastructure:**
- Database partitioning by region
- Edge caching for map tiles
- AI model fine-tuning on accumulated data

### Phase 4: AI Premium Features (500K-1M users)

**Product:**
- Premium AI route tracing
- Predictive loss zones ("Be careful in this area")
- Smart alerts based on behavioral patterns
- Photo enhancement for better matching

### Phase 5: API & Partnerships (1M+ users)

**Product:**
- Public API for municipalities
- Police department integration
- Insurance company partnerships
- International expansion (country-by-country)

**Infrastructure:**
- Multi-region deployment
- Database sharding by country
- Dedicated AI infrastructure
- 99.9% SLA commitment

### 9.1 Scaling Technical Details

**Database scaling path:**
```
Phase 1:  Single Postgres instance (Supabase)
Phase 2:  + Read replicas for feed/map queries
Phase 3:  + Table partitioning (posts by created_at month)
Phase 4:  + Dedicated pgvector instance for AI queries
Phase 5:  + Regional sharding (EU, US, APAC)
```

**AI cost control at scale:**
```
Phase 1:  Direct API calls ($125/mo)
Phase 2:  + Response caching, batch processing ($400/mo)
Phase 3:  + Fine-tuned smaller models ($800/mo)
Phase 4:  + Self-hosted CLIP model for embeddings ($1,200/mo)
Phase 5:  + Dedicated GPU inference cluster ($3,000/mo)
```

**Notification scaling:**
```
Phase 1:  Direct FCM calls
Phase 2:  + Queued delivery with priority levels
Phase 3:  + Digest mode (batch non-urgent notifications)
Phase 4:  + Smart delivery timing (user activity patterns)
Phase 5:  + Multi-channel orchestration (push + email + SMS)
```

**Moderation scaling:**
```
Phase 1:  AI auto-mod + admin review
Phase 2:  + Community moderators (trusted users)
Phase 3:  + Automated escalation workflows
Phase 4:  + ML-based fraud detection
Phase 5:  + Regional moderation teams
```

---

## 10. Technical Risks & Mitigation

### Risk Matrix

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **Low match quality** | HIGH | MEDIUM | A/B test scoring weights; human feedback loop to improve; expose confidence score to users |
| **AI API costs spike** | MEDIUM | MEDIUM | Budget caps, caching, model tiering, lazy processing |
| **Map performance on low-end devices** | MEDIUM | HIGH | Clustering, viewport-based loading, reduce pin count, simplify animations |
| **Privacy/GDPR complaints** | HIGH | LOW | Data minimization, encryption, deletion endpoints, privacy-by-design |
| **Spam/fraud posts** | HIGH | HIGH | AI moderation, rate limiting, phone verification (Phase 2), community reporting |
| **Chat abuse** | MEDIUM | MEDIUM | Content filtering, report system, temporary bans, encrypted storage |
| **Supabase vendor lock-in** | LOW | LOW | Standard PostgreSQL, abstract storage layer, keep auth portable |
| **Image storage costs** | MEDIUM | MEDIUM | Aggressive thumbnailing, WebP conversion, lifecycle policies (delete after 90 days resolved) |
| **Real-time connection limits** | MEDIUM | LOW | Connection pooling, presence optimization, fallback to polling |
| **Cold start / empty map** | HIGH | HIGH | Seed with municipal data, partnerships with existing lost/found services, incentivize early posting |

### Critical Path Dependencies

```
Authentication ──→ Post Creation ──→ Matching Engine ──→ Notifications
                        │                                      │
                        ├──→ Map Display                       │
                        │                                      │
                        └──→ AI Processing ────────────────────┘
```

### MVP Build Order

```
Week 1-2:  Auth + User profiles + Database schema
Week 3-4:  Post creation flow + Image upload + Map display
Week 5-6:  AI integration + Matching engine
Week 7-8:  Chat system + Notifications
Week 9-10: Moderation tools + Admin dashboard
Week 11-12: Polish, testing, soft launch
```

---

## Appendix A: API Endpoint Overview

```
Authentication
  POST   /auth/register
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/logout
  POST   /auth/social/:provider

Posts
  GET    /posts                    (feed with filters)
  GET    /posts/map                (GeoJSON for map)
  GET    /posts/:id
  POST   /posts
  PATCH  /posts/:id
  DELETE /posts/:id
  POST   /posts/:id/boost
  POST   /posts/:id/images

Matches
  GET    /matches                  (user's matches)
  GET    /matches/:id
  POST   /matches/:id/confirm
  POST   /matches/:id/reject

Chat
  GET    /conversations
  GET    /conversations/:id/messages
  POST   /conversations/:id/messages
  PATCH  /conversations/:id/close

Notifications
  GET    /notifications
  PATCH  /notifications/:id/read
  POST   /notifications/read-all

Users
  GET    /users/me
  PATCH  /users/me
  GET    /users/:id/profile
  DELETE /users/me                 (GDPR deletion)

Reports
  POST   /reports

Admin
  GET    /admin/reports
  PATCH  /admin/reports/:id
  GET    /admin/users
  PATCH  /admin/users/:id/suspend
  GET    /admin/stats
```

## Appendix B: Environment Variables

```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=
DIRECT_DATABASE_URL=

# Redis
REDIS_URL=

# AI
OPENAI_API_KEY=
GOOGLE_CLOUD_VISION_KEY=

# Maps
MAPBOX_ACCESS_TOKEN=
MAPBOX_SECRET_TOKEN=

# Push Notifications
FCM_SERVER_KEY=
FCM_PROJECT_ID=
APNS_KEY_ID=
APNS_TEAM_ID=

# Email
SENDGRID_API_KEY=

# Security
JWT_SECRET=
ENCRYPTION_KEY=

# App
APP_ENV=production
APP_URL=https://refind.app
API_URL=https://api.refind.app
```
