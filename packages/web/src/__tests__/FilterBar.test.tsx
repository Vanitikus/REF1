import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/FilterBar';

describe('FilterBar', () => {
  const defaultProps = {
    activeType: 'all' as const,
    activeCategory: 'all' as const,
    onTypeChange: vi.fn(),
    onCategoryChange: vi.fn(),
  };

  it('renders all type filter buttons', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getAllByText('Toate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Pierdute')).toBeInTheDocument();
    expect(screen.getByText('Gasite')).toBeInTheDocument();
  });

  it('renders all category filter buttons', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText('Animale')).toBeInTheDocument();
    expect(screen.getByText('Obiecte')).toBeInTheDocument();
    expect(screen.getByText('Documente')).toBeInTheDocument();
  });

  it('calls onTypeChange when type filter clicked', async () => {
    const onTypeChange = vi.fn();
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} onTypeChange={onTypeChange} />);

    await user.click(screen.getByText('Pierdute'));
    expect(onTypeChange).toHaveBeenCalledWith('lost');
  });

  it('calls onCategoryChange when category filter clicked', async () => {
    const onCategoryChange = vi.fn();
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} onCategoryChange={onCategoryChange} />);

    await user.click(screen.getByText('Animale'));
    expect(onCategoryChange).toHaveBeenCalledWith('pet');
  });

  it('highlights active type filter', () => {
    render(<FilterBar {...defaultProps} activeType="lost" />);
    const lostBtn = screen.getByText('Pierdute');
    expect(lostBtn.className).toContain('bg-brand-orange-500');
  });

  it('highlights active category filter', () => {
    render(<FilterBar {...defaultProps} activeCategory="pet" />);
    const petBtn = screen.getByText('Animale');
    expect(petBtn.className).toContain('bg-gray-900');
  });
});
