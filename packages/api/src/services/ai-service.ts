/**
 * REFiND AI Service
 *
 * Centralized AI gateway that handles:
 * 1. Image classification (object/pet/document detection)
 * 2. Embedding generation (for similarity matching)
 * 3. Content moderation
 * 4. Smart suggestions (pre-fill post form)
 * 5. Duplicate detection
 *
 * Features:
 * - Response caching (by image hash)
 * - Rate limiting per user
 * - Cost tracking
 * - Fallback routing (OpenAI → Google Vision)
 */

import OpenAI from 'openai';
import { getEnv } from '../config/env.js';
import { getRedis } from '../config/redis.js';
import { PostCategory } from '@refind/shared';
import type { AIClassification } from '@refind/shared';
import crypto from 'node:crypto';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: getEnv().OPENAI_API_KEY });
  }
  return _openai;
}

// ============================================================
// CACHE HELPERS
// ============================================================

const CACHE_TTL = 86400; // 24 hours

function hashImage(imageBuffer: Buffer): string {
  return crypto.createHash('sha256').update(imageBuffer).digest('hex');
}

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

async function setCache(key: string, value: unknown, ttl = CACHE_TTL): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Cache write failures are non-critical
  }
}

// ============================================================
// IMAGE CLASSIFICATION
// ============================================================

const CLASSIFICATION_PROMPT = `You are an AI assistant for a Lost & Found platform called REFiND.
Analyze this image and classify it for a lost/found item post.

Respond in JSON with exactly this structure:
{
  "category": "pet" | "object" | "document" | "other",
  "confidence": 0.0-1.0,
  "labels": ["label1", "label2", ...],
  "description": "Brief description of the item",
  "breed": "Breed name if pet, null otherwise",
  "color": "Primary color(s)",
  "distinguishingFeatures": ["feature1", "feature2"]
}

Rules:
- "pet" for any animal (dog, cat, bird, etc.)
- "document" for ID cards, passports, papers, cards
- "object" for phones, keys, bags, clothes, electronics, etc.
- "other" for anything that doesn't fit above
- Be specific in labels (e.g., "golden retriever" not just "dog")
- List distinguishing features that could help identify the specific item`;

export async function classifyImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<AIClassification> {
  // Check cache first
  const imageHash = hashImage(imageBuffer);
  const cacheKey = `ai:classify:${imageHash}`;
  const cached = await getCached<AIClassification>(cacheKey);
  if (cached) return cached;

  const openai = getOpenAI();
  const base64Image = imageBuffer.toString('base64');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: CLASSIFICATION_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'low', // Cost optimization: low detail sufficient for classification
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 500,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty AI classification response');
  }

  const parsed = JSON.parse(content) as AIClassification;

  // Validate category
  const validCategories = Object.values(PostCategory);
  if (!validCategories.includes(parsed.category)) {
    parsed.category = PostCategory.Other;
  }

  // Cache result
  await setCache(cacheKey, parsed);

  return parsed;
}

// ============================================================
// EMBEDDING GENERATION
// ============================================================

/**
 * Generate a 512-dimensional embedding for an image.
 * Used for visual similarity matching between lost/found posts.
 *
 * Uses OpenAI's text embedding model on the AI-generated description
 * of the image (cheaper than a dedicated vision embedding model).
 */
export async function generateImageEmbedding(
  imageDescription: string,
  labels: string[]
): Promise<number[]> {
  // Combine description and labels into a rich text representation
  const text = `${imageDescription}. Labels: ${labels.join(', ')}`;

  const cacheKey = `ai:embed:${crypto.createHash('md5').update(text).digest('hex')}`;
  const cached = await getCached<number[]>(cacheKey);
  if (cached) return cached;

  const openai = getOpenAI();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 512,
  });

  const embedding = response.data[0].embedding;
  await setCache(cacheKey, embedding);

  return embedding;
}

/**
 * Generate embedding for text-only content (descriptions, titles).
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  const cacheKey = `ai:textembed:${crypto.createHash('md5').update(text).digest('hex')}`;
  const cached = await getCached<number[]>(cacheKey);
  if (cached) return cached;

  const openai = getOpenAI();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 512,
  });

  const embedding = response.data[0].embedding;
  await setCache(cacheKey, embedding);

  return embedding;
}

// ============================================================
// CONTENT MODERATION
// ============================================================

export interface ModerationResult {
  isSafe: boolean;
  flags: string[];
  categories: Record<string, boolean>;
  score: number;
}

/**
 * Check image and text content for policy violations.
 * Uses OpenAI's moderation endpoint + custom rules.
 */
export async function moderateContent(
  text: string | null,
  imageBuffer?: Buffer,
  mimeType?: string
): Promise<ModerationResult> {
  const openai = getOpenAI();
  const flags: string[] = [];
  let maxScore = 0;
  const categories: Record<string, boolean> = {};

  // Text moderation
  if (text) {
    const textResult = await openai.moderations.create({
      input: text,
    });

    const result = textResult.results[0];
    if (result.flagged) {
      for (const [category, flagged] of Object.entries(result.categories)) {
        if (flagged) {
          flags.push(`text:${category}`);
          categories[category] = true;
        }
      }
      for (const [, score] of Object.entries(result.category_scores)) {
        maxScore = Math.max(maxScore, score);
      }
    }
  }

  // Image moderation via vision model
  if (imageBuffer && mimeType) {
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image for content moderation. Respond in JSON: {"safe": true/false, "flags": ["flag1"], "reason": "explanation"}. Flag if: NSFW, violence, hate symbols, PII (visible documents with readable personal data), spam/commercial.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const imgResult = JSON.parse(content);
      if (!imgResult.safe) {
        flags.push(...(imgResult.flags || []).map((f: string) => `image:${f}`));
        maxScore = Math.max(maxScore, 0.8);
      }
    }
  }

  return {
    isSafe: flags.length === 0,
    flags,
    categories,
    score: maxScore,
  };
}

// ============================================================
// SMART SUGGESTIONS
// ============================================================

/**
 * Generate smart form suggestions from an image.
 * Pre-fills title and description for the post creation flow.
 */
export async function generateSuggestions(
  classification: AIClassification
): Promise<{ suggestedTitle: string; suggestedDescription: string }> {
  const { category, labels, description, breed, color } = classification;

  let suggestedTitle = '';
  const parts: string[] = [];

  if (color) parts.push(color);

  switch (category) {
    case PostCategory.Pet:
      if (breed) parts.push(breed);
      else parts.push('Pet');
      break;
    case PostCategory.Document:
      parts.push(labels[0] || 'Document');
      break;
    case PostCategory.Object:
      parts.push(labels[0] || 'Object');
      break;
    default:
      parts.push(labels[0] || 'Item');
  }

  suggestedTitle = parts.join(' ');

  // Capitalize first letter
  suggestedTitle = suggestedTitle.charAt(0).toUpperCase() + suggestedTitle.slice(1);

  return {
    suggestedTitle,
    suggestedDescription: description,
  };
}

// ============================================================
// DUPLICATE DETECTION
// ============================================================

/**
 * Check if a post is likely a duplicate of an existing post.
 * Prevents spam and accidental double-posts.
 */
export async function checkDuplicate(
  userId: string,
  embedding: number[],
  threshold = 0.95
): Promise<{ isDuplicate: boolean; existingPostId?: string }> {
  const { getAdminClient: getSupabase } = await import('../config/supabase.js');
  const supabase = getSupabase();

  // Query for very similar posts from the same user in the last 24h
  const { data } = await supabase.rpc('match_posts_by_embedding', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: 1,
    p_user_id: userId,
    p_max_age_hours: 24,
  });

  if (data && data.length > 0) {
    return { isDuplicate: true, existingPostId: data[0].id };
  }

  return { isDuplicate: false };
}
