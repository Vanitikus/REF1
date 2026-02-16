import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import AuthPage from '@/app/autentificare/page';

function renderPage() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('Auth Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login form by default', () => {
    renderPage();
    expect(screen.getByText('Conecteaza-te la contul tau')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@exemplu.ro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Parola ta')).toBeInTheDocument();
  });

  it('renders social auth buttons', () => {
    renderPage();
    expect(screen.getByText('Continua cu Google')).toBeInTheDocument();
    expect(screen.getByText('Continua cu GitHub')).toBeInTheDocument();
  });

  it('switches to register mode', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Inregistreaza-te'));
    expect(screen.getByText('Creeaza un cont nou')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ion Popescu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeta parola')).toBeInTheDocument();
  });

  it('switches to reset password mode', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Ai uitat parola?'));
    expect(screen.getByText('Reseteaza parola')).toBeInTheDocument();
    expect(screen.getByText('Trimite link de resetare')).toBeInTheDocument();
  });

  it('shows terms links in register mode', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Inregistreaza-te'));
    const termsLink = screen.getByText('Termenii si Conditiile');
    const privacyLink = screen.getByText('Politica de Confidentialitate');
    expect(termsLink).toHaveAttribute('href', '/termeni');
    expect(privacyLink).toHaveAttribute('href', '/confidentialitate');
  });

  it('shows error for short password on login', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('email@exemplu.ro'), 'test@test.ro');
    await user.type(screen.getByPlaceholderText('Parola ta'), '123');
    await user.click(screen.getByText('Conecteaza-te', { selector: 'button' }));

    await waitFor(() => {
      expect(screen.getByText(/Parola trebuie/)).toBeInTheDocument();
    });
  });

  it('shows ReFind logo', () => {
    renderPage();
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
  });

  it('shows password mismatch error on register', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Inregistreaza-te'));
    await user.type(screen.getByPlaceholderText('Ion Popescu'), 'Test User');
    await user.type(screen.getByPlaceholderText('email@exemplu.ro'), 'test@test.ro');
    await user.type(screen.getByPlaceholderText('Minim 6 caractere'), 'password123');
    await user.type(screen.getByPlaceholderText('Repeta parola'), 'different');
    await user.click(screen.getByText('Creeaza cont'));

    await waitFor(() => {
      expect(screen.getByText('Parolele nu coincid')).toBeInTheDocument();
    });
  });
});
