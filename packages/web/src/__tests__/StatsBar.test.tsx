import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsBar } from '@/components/StatsBar';

describe('StatsBar', () => {
  it('renders all three stat cards', () => {
    render(<StatsBar />);
    expect(screen.getByText('1,247')).toBeInTheDocument();
    expect(screen.getByText('3,891')).toBeInTheDocument();
    expect(screen.getByText('89%')).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    render(<StatsBar />);
    expect(screen.getByText('Obiecte recuperate')).toBeInTheDocument();
    expect(screen.getByText('Posturi active')).toBeInTheDocument();
    expect(screen.getByText('Rata de succes')).toBeInTheDocument();
  });
});
