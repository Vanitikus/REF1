import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo, LogoIcon } from '@/components/Logo';

describe('Logo', () => {
  it('renders ReFind text', () => {
    render(<Logo />);
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
  });

  it('links to home page', () => {
    render(<Logo />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders SVG logo icon', () => {
    render(<Logo />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container: smContainer } = render(<Logo size="sm" />);
    const smDiv = smContainer.querySelector('.w-7');
    expect(smDiv).toBeInTheDocument();
  });
});

describe('LogoIcon', () => {
  it('renders SVG', () => {
    render(<LogoIcon />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('contains teal pin and orange heart colors', () => {
    render(<LogoIcon />);
    const paths = document.querySelectorAll('path');
    const fills = Array.from(paths).map((p) => p.getAttribute('fill'));
    expect(fills).toContain('#2EC4B6');
    expect(fills).toContain('#F2994A');
  });
});
