import { describe, it, expect } from 'vitest';
import { MOCK_POSTS, getTimeAgo, CATEGORY_LABELS, CATEGORY_EMOJI } from '@/lib/mock-data';

describe('MOCK_POSTS', () => {
  it('has 8 posts', () => {
    expect(MOCK_POSTS).toHaveLength(8);
  });

  it('each post has required fields', () => {
    for (const post of MOCK_POSTS) {
      expect(post.id).toBeTruthy();
      expect(post.type).toMatch(/^(lost|found)$/);
      expect(post.category).toMatch(/^(pet|object|document|other)$/);
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.locationName).toBeTruthy();
      expect(post.location).toHaveProperty('lat');
      expect(post.location).toHaveProperty('lng');
      expect(post.createdAt).toBeTruthy();
      expect(post.user).toBeDefined();
      expect(post.user.displayName).toBeTruthy();
      expect(post.user.avatarInitial).toBeTruthy();
      expect(typeof post.user.communityScore).toBe('number');
      expect(typeof post.user.isVerified).toBe('boolean');
      expect(typeof post.viewCount).toBe('number');
      expect(typeof post.matchCount).toBe('number');
    }
  });

  it('has unique IDs', () => {
    const ids = MOCK_POSTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has both lost and found types', () => {
    const types = new Set(MOCK_POSTS.map((p) => p.type));
    expect(types.has('lost')).toBe(true);
    expect(types.has('found')).toBe(true);
  });

  it('has valid coordinates (Bucharest area)', () => {
    for (const post of MOCK_POSTS) {
      expect(post.location.lat).toBeGreaterThan(44.3);
      expect(post.location.lat).toBeLessThan(44.6);
      expect(post.location.lng).toBeGreaterThan(25.9);
      expect(post.location.lng).toBeLessThan(26.3);
    }
  });

  it('reward is null or positive number', () => {
    for (const post of MOCK_POSTS) {
      if (post.rewardAmount !== null) {
        expect(post.rewardAmount).toBeGreaterThan(0);
        expect(post.rewardCurrency).toBe('RON');
      }
    }
  });
});

describe('getTimeAgo', () => {
  it('returns "acum" for just now', () => {
    const now = new Date().toISOString();
    expect(getTimeAgo(now)).toBe('acum');
  });

  it('returns minutes for recent times', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(getTimeAgo(fiveMinAgo)).toBe('acum 5 min');
  });

  it('returns hours for hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(twoHoursAgo)).toBe('acum 2h');
  });

  it('returns "ieri" for 1 day ago', () => {
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(yesterday)).toBe('ieri');
  });

  it('returns days for older dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(threeDaysAgo)).toBe('acum 3 zile');
  });
});

describe('CATEGORY_LABELS', () => {
  it('has all 4 categories', () => {
    expect(CATEGORY_LABELS.pet).toBe('Animal');
    expect(CATEGORY_LABELS.object).toBe('Obiect');
    expect(CATEGORY_LABELS.document).toBe('Document');
    expect(CATEGORY_LABELS.other).toBe('Altele');
  });
});

describe('CATEGORY_EMOJI', () => {
  it('has emoji for all 4 categories', () => {
    expect(CATEGORY_EMOJI.pet).toBeTruthy();
    expect(CATEGORY_EMOJI.object).toBeTruthy();
    expect(CATEGORY_EMOJI.document).toBeTruthy();
    expect(CATEGORY_EMOJI.other).toBeTruthy();
  });
});
