import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/lib/theme-context';

function TestConsumer() {
  const { isDark, toggle } = useTheme();
  return (
    <div>
      <span data-testid="dark">{String(isDark)}</span>
      <button onClick={toggle}>Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light mode', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dark')).toHaveTextContent('false');
    });
  });

  it('toggles to dark mode and adds class', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dark')).toHaveTextContent('false');
    });

    await user.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('dark')).toHaveTextContent('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('refind_theme')).toBe('dark');
  });

  it('restores dark mode from localStorage', async () => {
    localStorage.setItem('refind_theme', 'dark');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dark')).toHaveTextContent('true');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles back to light mode', async () => {
    const user = userEvent.setup();
    localStorage.setItem('refind_theme', 'dark');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dark')).toHaveTextContent('true');
    });

    await user.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('dark')).toHaveTextContent('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('refind_theme')).toBe('light');
  });
});
