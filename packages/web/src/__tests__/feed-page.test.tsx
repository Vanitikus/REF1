import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import FeedPage from '@/app/page';

function renderPage() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <FeedPage />
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('Feed Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the hero section', () => {
    renderPage();
    expect(screen.getByText(/Ai pierdut ceva/)).toBeInTheDocument();
  });

  it('renders stats bar', () => {
    renderPage();
    expect(screen.getByText('Obiecte recuperate')).toBeInTheDocument();
  });

  it('renders filter bar with type filters', () => {
    renderPage();
    expect(screen.getByText('Pierdute')).toBeInTheDocument();
    expect(screen.getByText('Gasite')).toBeInTheDocument();
  });

  it('renders post cards', () => {
    renderPage();
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBeGreaterThan(0);
  });

  it('filters posts by type when clicking Pierdute', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Pierdute'));

    const badges = screen.queryAllByText('Gasit');
    expect(badges.length).toBe(0);
  });

  it('filters posts by type when clicking Gasite', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Gasite'));

    const badges = screen.queryAllByText('Pierdut');
    expect(badges.length).toBe(0);
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Animale'));

    const articles = screen.getAllByRole('article');
    expect(articles.length).toBeGreaterThan(0);
    // All visible posts should be pet category
    for (const article of articles) {
      expect(within(article).getByText('Animal')).toBeInTheDocument();
    }
  });

  it('has sort dropdown', () => {
    renderPage();
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toBeInTheDocument();
  });

  it('shows "no results" when filters match nothing', async () => {
    const user = userEvent.setup();
    renderPage();

    // Filter to documents + lost (no lost documents in mock data)
    await user.click(screen.getByText('Pierdute'));
    await user.click(screen.getByText('Documente'));

    expect(screen.getByText(/Niciun rezultat/)).toBeInTheDocument();
  });

  it('shows "Posteaza" CTA for unauthenticated users', () => {
    renderPage();
    expect(screen.getByText(/Posteaza acum/)).toBeInTheDocument();
  });
});
