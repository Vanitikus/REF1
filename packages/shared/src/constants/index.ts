/**
 * REFiND Shared Constants
 */

// ============================================================
// MATCHING ENGINE CONSTANTS
// ============================================================

export const MATCH_WEIGHTS = {
  location: 0.30,
  visual: 0.30,
  category: 0.20,
  time: 0.10,
  text: 0.10,
} as const;

export const MATCH_THRESHOLDS = {
  /** Minimum score to create a match record */
  minimum: 0.45,
  /** Score for high-confidence notification */
  highConfidence: 0.70,
  /** Score for urgent notification with badge */
  urgent: 0.85,
} as const;

export const MATCH_LIMITS = {
  /** Maximum distance in meters for candidate search */
  maxDistanceMeters: 10_000,
  /** Maximum age in days for candidate search */
  maxAgeDays: 14,
  /** Maximum candidates to evaluate per match run */
  maxCandidates: 20,
} as const;

// ============================================================
// LOCATION SCORING
// ============================================================

export const LOCATION_SCORE = {
  /** Distance below which score is 1.0 */
  perfectDistanceMeters: 200,
  /** Distance at which score drops to 0.0 */
  maxDistanceMeters: 5_000,
} as const;

// ============================================================
// TIME SCORING
// ============================================================

export const TIME_SCORE = {
  /** Hours below which score is 1.0 */
  perfectHours: 1,
  /** Hours at which score drops to 0.0 */
  maxHours: 168, // 1 week
} as const;

// ============================================================
// POST CONSTRAINTS
// ============================================================

export const POST_CONSTRAINTS = {
  titleMinLength: 5,
  titleMaxLength: 200,
  descriptionMaxLength: 2000,
  maxImagesPerPost: 5,
  maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
  defaultExpiryDays: 30,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
} as const;

// ============================================================
// USER CONSTRAINTS
// ============================================================

export const USER_CONSTRAINTS = {
  displayNameMinLength: 2,
  displayNameMaxLength: 50,
  maxAlertZones: 5,
  maxDeviceTokens: 10,
} as const;

// ============================================================
// RATE LIMITS
// ============================================================

export const RATE_LIMITS = {
  /** Requests per minute per IP */
  globalPerMinutePerIP: 100,
  /** Requests per minute per authenticated user */
  globalPerMinutePerUser: 200,
  /** Posts per hour per user */
  postsPerHour: 5,
  /** Messages per minute per user */
  messagesPerMinute: 30,
  /** Reports per hour per user */
  reportsPerHour: 10,
  /** AI requests per hour per user */
  aiRequestsPerHour: 10,
} as const;

// ============================================================
// GAMIFICATION
// ============================================================

export const COMMUNITY_SCORE = {
  /** Points earned when a match is confirmed */
  matchConfirmed: 10,
  /** Points earned for creating a post */
  postCreated: 1,
  /** Points earned when a post is resolved */
  postResolved: 5,
  /** Score required for "Trusted" badge */
  trustedBadgeThreshold: 50,
  /** Score required for moderator nomination */
  moderatorThreshold: 200,
} as const;

// ============================================================
// NOTIFICATION RADIUS DEFAULTS
// ============================================================

export const ALERT_ZONE_DEFAULTS = {
  defaultRadiusMeters: 500,
  minRadiusMeters: 100,
  maxRadiusMeters: 10_000,
} as const;

// ============================================================
// MAP CONSTANTS
// ============================================================

export const MAP_CONFIG = {
  /** Default map center (Bucharest, Romania) */
  defaultCenter: { lng: 26.1025, lat: 44.4268 },
  /** Default zoom level */
  defaultZoom: 13,
  /** Zoom level at which individual pins show */
  pinVisibilityZoom: 13,
  /** Max posts to render on map at once */
  maxMapPosts: 500,
  /** Cluster radius in pixels */
  clusterRadius: 50,
  /** Max zoom for clustering */
  clusterMaxZoom: 14,
} as const;

// ============================================================
// PIN COLORS
// ============================================================

export const PIN_COLORS = {
  lost: '#FF6B6B',
  found: '#51CF66',
  update: '#339AF0',
  reward: '#FFD43B',
} as const;

// ============================================================
// SUPPORTED LOCALES
// ============================================================

export const SUPPORTED_LOCALES = ['ro', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'ro';
