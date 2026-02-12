/**
 * REFiND Shared Types
 * Central type definitions used across API, mobile, and web packages.
 */

// ============================================================
// ENUMS
// ============================================================

export enum UserRole {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
}

export enum PostType {
  Lost = 'lost',
  Found = 'found',
}

export enum PostStatus {
  Active = 'active',
  Resolved = 'resolved',
  Expired = 'expired',
  Removed = 'removed',
}

export enum PostCategory {
  Pet = 'pet',
  Object = 'object',
  Document = 'document',
  Other = 'other',
}

export enum ContactPreference {
  Chat = 'chat',
  Phone = 'phone',
  Both = 'both',
}

export enum MatchStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
  Expired = 'expired',
}

export enum ConversationStatus {
  Active = 'active',
  Closed = 'closed',
  Reported = 'reported',
}

export enum MessageType {
  Text = 'text',
  Image = 'image',
  System = 'system',
}

export enum NotificationType {
  Match = 'match',
  Message = 'message',
  RadiusAlert = 'radius_alert',
  System = 'system',
  Moderation = 'moderation',
}

export enum ReportReason {
  Spam = 'spam',
  Inappropriate = 'inappropriate',
  Fraud = 'fraud',
  Harassment = 'harassment',
  Other = 'other',
}

export enum ReportStatus {
  Pending = 'pending',
  Reviewing = 'reviewing',
  Resolved = 'resolved',
  Dismissed = 'dismissed',
}

export enum RewardStatus {
  Offered = 'offered',
  Claimed = 'claimed',
  Paid = 'paid',
  Cancelled = 'cancelled',
}

export enum DevicePlatform {
  IOS = 'ios',
  Android = 'android',
  Web = 'web',
}

// ============================================================
// GEO TYPES
// ============================================================

export interface GeoPoint {
  lng: number;
  lat: number;
}

export interface GeoBounds {
  sw: GeoPoint;
  ne: GeoPoint;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: PostMapProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// ============================================================
// USER TYPES
// ============================================================

export interface User {
  id: string;
  authId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  communityScore: number;
  isVerified: boolean;
  isSuspended: boolean;
  locale: 'ro' | 'en';
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  communityScore: number;
  isVerified: boolean;
  createdAt: string;
  activePostsCount: number;
  resolvedPostsCount: number;
}

// ============================================================
// POST TYPES
// ============================================================

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  status: PostStatus;
  category: PostCategory;
  title: string;
  description: string | null;
  location: GeoPoint;
  locationName: string | null;
  routeGeometry: GeoPoint[] | null;
  rewardAmount: number | null;
  rewardCurrency: string;
  contactPreference: ContactPreference;
  aiCategorySuggestion: string | null;
  aiLabels: string[];
  viewCount: number;
  isBoosted: boolean;
  boostExpiresAt: string | null;
  expiresAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  images: PostImage[];
  user: UserProfile;
}

export interface PostImage {
  id: string;
  postId: string;
  originalUrl: string;
  thumbnailUrl: string;
  aiLabels: string[];
  displayOrder: number;
  createdAt: string;
}

export interface PostMapProperties {
  id: string;
  type: PostType;
  category: PostCategory;
  title: string;
  status: PostStatus;
  rewardAmount: number | null;
  isBoosted: boolean;
  createdAt: string;
  thumbnailUrl: string | null;
}

export interface CreatePostInput {
  type: PostType;
  category: PostCategory;
  title: string;
  description?: string;
  location: GeoPoint;
  locationName?: string;
  routeGeometry?: GeoPoint[];
  rewardAmount?: number;
  rewardCurrency?: string;
  contactPreference?: ContactPreference;
}

export interface PostFilters {
  type?: PostType;
  category?: PostCategory;
  bounds?: GeoBounds;
  search?: string;
  userId?: string;
  status?: PostStatus;
  limit?: number;
  offset?: number;
}

// ============================================================
// MATCH TYPES
// ============================================================

export interface Match {
  id: string;
  lostPostId: string;
  foundPostId: string;
  confidenceScore: number;
  matchFactors: MatchFactors;
  status: MatchStatus;
  confirmedByLost: boolean;
  confirmedByFound: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  lostPost?: Post;
  foundPost?: Post;
}

export interface MatchFactors {
  location: number;
  visual: number;
  category: number;
  time: number;
  text: number;
}

export interface MatchCandidate {
  candidateId: string;
  distanceMeters: number;
  timeDiffHours: number;
  visualSimilarity: number;
  candidateType: PostType;
  candidateCategory: PostCategory;
}

// ============================================================
// CHAT TYPES
// ============================================================

export interface Conversation {
  id: string;
  matchId: string | null;
  participantIds: string[];
  status: ConversationStatus;
  lastMessageAt: string | null;
  createdAt: string;
  // Joined
  otherParticipant?: UserProfile;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string; // Decrypted client-side
  messageType: MessageType;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType?: MessageType;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  isPushed: boolean;
  createdAt: string;
}

// ============================================================
// REPORT TYPES
// ============================================================

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user' | 'message';
  targetId: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  moderatorId: string | null;
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateReportInput {
  targetType: 'post' | 'user' | 'message';
  targetId: string;
  reason: ReportReason;
  description?: string;
}

// ============================================================
// REWARD TYPES
// ============================================================

export interface Reward {
  id: string;
  postId: string;
  offeredBy: string;
  claimedBy: string | null;
  amount: number;
  currency: string;
  status: RewardStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ALERT ZONE TYPES
// ============================================================

export interface AlertZone {
  id: string;
  userId: string;
  center: GeoPoint;
  radiusMeters: number;
  categories: PostCategory[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateAlertZoneInput {
  center: GeoPoint;
  radiusMeters: number;
  categories?: PostCategory[];
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================
// AI TYPES
// ============================================================

export interface AIClassification {
  category: PostCategory;
  confidence: number;
  labels: string[];
  description: string;
  breed?: string; // For pets
  color?: string;
  distinguishingFeatures?: string[];
}

export interface AISimilarityResult {
  postId: string;
  similarity: number;
  matchedLabels: string[];
}

export interface HeatZoneData {
  lng: number;
  lat: number;
  intensity: number;
  lostCount: number;
  foundCount: number;
}
