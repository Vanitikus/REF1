import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/PostCard';
import { MOCK_POSTS } from '@/lib/mock-data';

describe('PostCard', () => {
  const lostPost = MOCK_POSTS.find((p) => p.type === 'lost')!;
  const foundPost = MOCK_POSTS.find((p) => p.type === 'found')!;

  it('renders post title', () => {
    render(<PostCard post={lostPost} />);
    expect(screen.getByText(lostPost.title)).toBeInTheDocument();
  });

  it('renders location name', () => {
    render(<PostCard post={lostPost} />);
    expect(screen.getByText(lostPost.locationName)).toBeInTheDocument();
  });

  it('shows "Pierdut" badge for lost posts', () => {
    render(<PostCard post={lostPost} />);
    expect(screen.getByText('Pierdut')).toBeInTheDocument();
  });

  it('shows "Gasit" badge for found posts', () => {
    render(<PostCard post={foundPost} />);
    expect(screen.getByText('Gasit')).toBeInTheDocument();
  });

  it('displays reward when present', () => {
    const postWithReward = MOCK_POSTS.find((p) => p.rewardAmount)!;
    render(<PostCard post={postWithReward} />);
    expect(screen.getByText(new RegExp(`${postWithReward.rewardAmount}`))).toBeInTheDocument();
  });

  it('does not display reward when null', () => {
    const postNoReward = MOCK_POSTS.find((p) => p.rewardAmount === null)!;
    render(<PostCard post={postNoReward} />);
    expect(screen.queryByText(/Recompensa/)).not.toBeInTheDocument();
  });

  it('shows "Promovat" badge for boosted posts', () => {
    const boostedPost = MOCK_POSTS.find((p) => p.isBoosted)!;
    render(<PostCard post={boostedPost} />);
    expect(screen.getByText(/Promovat/)).toBeInTheDocument();
  });

  it('displays user name', () => {
    render(<PostCard post={lostPost} />);
    expect(screen.getByText(lostPost.user.displayName)).toBeInTheDocument();
  });

  it('displays view count', () => {
    render(<PostCard post={lostPost} />);
    expect(screen.getByText(new RegExp(String(lostPost.viewCount)))).toBeInTheDocument();
  });

  it('links to post detail page', () => {
    render(<PostCard post={lostPost} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/post/${lostPost.id}`);
  });

  it('shows match count when > 0', () => {
    const postWithMatches = MOCK_POSTS.find((p) => p.matchCount > 0)!;
    render(<PostCard post={postWithMatches} />);
    expect(screen.getByText(new RegExp(`${postWithMatches.matchCount} match`))).toBeInTheDocument();
  });

  it('renders post emoji', () => {
    render(<PostCard post={lostPost} />);
    expect(screen.getByText(lostPost.imageEmoji)).toBeInTheDocument();
  });
});
