/**
 * REFiND Matching Engine
 *
 * Multi-signal scoring engine that matches lost items with found items.
 * Combines location proximity, visual similarity, category match,
 * time proximity, and text similarity into a weighted confidence score.
 *
 * Pipeline:
 * 1. Candidate filtering (SQL/PostGIS — fast spatial pre-filter)
 * 2. Multi-signal scoring
 * 3. Threshold filtering
 * 4. Match record creation
 * 5. Notification dispatch
 */

import { getAdminClient } from '../config/supabase.js';
import {
  MATCH_WEIGHTS,
  MATCH_THRESHOLDS,
  MATCH_LIMITS,
  LOCATION_SCORE,
  TIME_SCORE,
} from '@refind/shared';
import type { MatchCandidate, MatchFactors } from '@refind/shared';

// ============================================================
// SCORING FUNCTIONS
// ============================================================

/**
 * Location score: linear decay from 1.0 to 0.0 based on distance.
 * - < 200m  → 1.0 (nearby)
 * - 200m-5km → linear decay
 * - > 5km   → 0.0
 */
function computeLocationScore(distanceMeters: number): number {
  if (distanceMeters < LOCATION_SCORE.perfectDistanceMeters) {
    return 1.0;
  }
  if (distanceMeters >= LOCATION_SCORE.maxDistanceMeters) {
    return 0.0;
  }
  const range = LOCATION_SCORE.maxDistanceMeters - LOCATION_SCORE.perfectDistanceMeters;
  return 1.0 - (distanceMeters - LOCATION_SCORE.perfectDistanceMeters) / range;
}

/**
 * Time score: linear decay from 1.0 to 0.0 based on hours between posts.
 * - < 1h     → 1.0
 * - 1h-168h  → linear decay
 * - > 168h   → 0.0 (1 week)
 */
function computeTimeScore(timeDiffHours: number): number {
  if (timeDiffHours < TIME_SCORE.perfectHours) {
    return 1.0;
  }
  if (timeDiffHours >= TIME_SCORE.maxHours) {
    return 0.0;
  }
  const range = TIME_SCORE.maxHours - TIME_SCORE.perfectHours;
  return 1.0 - (timeDiffHours - TIME_SCORE.perfectHours) / range;
}

/**
 * Visual similarity score: directly from cosine similarity (0-1).
 * Pre-computed by pgvector in the candidate query.
 */
function computeVisualScore(cosineSimilarity: number): number {
  return Math.max(0, Math.min(1, cosineSimilarity));
}

/**
 * Category score: binary — 1.0 if match, 0.0 otherwise.
 * Category match is enforced as a hard filter in the SQL query,
 * so this always returns 1.0 for candidates that reach scoring.
 */
function computeCategoryScore(): number {
  return 1.0;
}

/**
 * Compute the weighted composite confidence score.
 */
function computeConfidenceScore(factors: MatchFactors): number {
  const totalWeight =
    MATCH_WEIGHTS.location +
    MATCH_WEIGHTS.visual +
    MATCH_WEIGHTS.category +
    MATCH_WEIGHTS.time +
    MATCH_WEIGHTS.text;

  const score =
    (MATCH_WEIGHTS.location * factors.location +
      MATCH_WEIGHTS.visual * factors.visual +
      MATCH_WEIGHTS.category * factors.category +
      MATCH_WEIGHTS.time * factors.time +
      MATCH_WEIGHTS.text * factors.text) /
    totalWeight;

  // Clamp to [0, 1] with 4 decimal precision
  return Math.round(Math.max(0, Math.min(1, score)) * 10000) / 10000;
}

// ============================================================
// MATCH PIPELINE
// ============================================================

export interface MatchResult {
  matchId: string;
  lostPostId: string;
  foundPostId: string;
  confidenceScore: number;
  matchFactors: MatchFactors;
}

/**
 * Run the matching pipeline for a newly created or updated post.
 *
 * 1. Fetch candidates via PostGIS spatial query
 * 2. Score each candidate using multi-signal weights
 * 3. Create match records for candidates above threshold
 * 4. Return created matches for notification dispatch
 */
export async function runMatchingPipeline(postId: string): Promise<MatchResult[]> {
  const supabase = getAdminClient();
  const results: MatchResult[] = [];

  // Step 1: Get match candidates from database function
  const { data: candidates, error: candidateError } = await supabase.rpc(
    'find_match_candidates',
    {
      p_post_id: postId,
      p_max_distance_meters: MATCH_LIMITS.maxDistanceMeters,
      p_max_age_days: MATCH_LIMITS.maxAgeDays,
      p_limit: MATCH_LIMITS.maxCandidates,
    }
  );

  if (candidateError) {
    console.error('[MatchEngine] Candidate query failed:', candidateError.message);
    return results;
  }

  if (!candidates || candidates.length === 0) {
    return results;
  }

  // Get the source post to determine lost_post_id vs found_post_id
  const { data: sourcePost } = await supabase
    .from('posts')
    .select('id, type, description')
    .eq('id', postId)
    .single();

  if (!sourcePost) return results;

  // Step 2 & 3: Score candidates and create match records
  for (const candidate of candidates as MatchCandidate[]) {
    const factors: MatchFactors = {
      location: computeLocationScore(candidate.distanceMeters),
      visual: computeVisualScore(candidate.visualSimilarity),
      category: computeCategoryScore(),
      time: computeTimeScore(candidate.timeDiffHours),
      text: 0, // Text similarity computed separately if descriptions available
    };

    const confidenceScore = computeConfidenceScore(factors);

    // Only create match if above minimum threshold
    if (confidenceScore < MATCH_THRESHOLDS.minimum) {
      continue;
    }

    // Determine which is lost and which is found
    const lostPostId = sourcePost.type === 'lost' ? postId : candidate.candidateId;
    const foundPostId = sourcePost.type === 'found' ? postId : candidate.candidateId;

    // Step 3: Insert match record
    const { data: match, error: insertError } = await supabase
      .from('matches')
      .insert({
        lost_post_id: lostPostId,
        found_post_id: foundPostId,
        confidence_score: confidenceScore,
        match_factors: factors,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      // Likely a duplicate match (unique constraint), skip silently
      if (insertError.code === '23505') continue;
      console.error('[MatchEngine] Insert match failed:', insertError.message);
      continue;
    }

    results.push({
      matchId: match.id,
      lostPostId,
      foundPostId,
      confidenceScore,
      matchFactors: factors,
    });
  }

  return results;
}

/**
 * Get the notification priority level based on confidence score.
 */
export function getMatchPriority(
  confidenceScore: number
): 'normal' | 'high' | 'urgent' {
  if (confidenceScore >= MATCH_THRESHOLDS.urgent) return 'urgent';
  if (confidenceScore >= MATCH_THRESHOLDS.highConfidence) return 'high';
  return 'normal';
}

/**
 * Confirm a match from one side (lost or found post owner).
 * If both sides confirm, the match is resolved.
 */
export async function confirmMatch(
  matchId: string,
  userId: string
): Promise<{ confirmed: boolean; fullyResolved: boolean }> {
  const supabase = getAdminClient();

  // Get the match and related posts
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id, lost_post_id, found_post_id,
      confirmed_by_lost, confirmed_by_found, status
    `)
    .eq('id', matchId)
    .single();

  if (!match || match.status !== 'pending') {
    return { confirmed: false, fullyResolved: false };
  }

  // Determine which side is confirming
  const { data: lostPost } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', match.lost_post_id)
    .single();

  const { data: foundPost } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', match.found_post_id)
    .single();

  const isLostOwner = lostPost?.user_id === userId;
  const isFoundOwner = foundPost?.user_id === userId;

  if (!isLostOwner && !isFoundOwner) {
    return { confirmed: false, fullyResolved: false };
  }

  const updateData: Record<string, unknown> = {};
  if (isLostOwner) updateData.confirmed_by_lost = true;
  if (isFoundOwner) updateData.confirmed_by_found = true;

  // Check if this confirmation completes the match
  const willBeFullyConfirmed =
    (isLostOwner && match.confirmed_by_found) ||
    (isFoundOwner && match.confirmed_by_lost);

  if (willBeFullyConfirmed) {
    updateData.status = 'confirmed';
    updateData.resolved_at = new Date().toISOString();
  }

  await supabase
    .from('matches')
    .update(updateData)
    .eq('id', matchId);

  return { confirmed: true, fullyResolved: willBeFullyConfirmed };
}
