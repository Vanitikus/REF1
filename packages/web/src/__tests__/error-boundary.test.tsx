import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '@/app/error';

describe('Error Boundary', () => {
  it('renders error message', () => {
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error('Test error')} reset={reset} />);

    expect(screen.getByText('Ceva nu a mers bine')).toBeInTheDocument();
    expect(screen.getByText(/eroare neasteptata/)).toBeInTheDocument();
  });

  it('renders try again button', () => {
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error('Test error')} reset={reset} />);

    expect(screen.getByText('Incearca din nou')).toBeInTheDocument();
  });

  it('calls reset when try again is clicked', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<ErrorBoundary error={new Error('Test error')} reset={reset} />);

    await user.click(screen.getByText('Incearca din nou'));
    expect(reset).toHaveBeenCalledOnce();
  });
});
