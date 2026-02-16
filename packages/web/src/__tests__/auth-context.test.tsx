import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.displayName : 'none'}</span>
      <button onClick={() => login('test@test.ro', 'password123')}>Login</button>
      <button onClick={() => register({ email: 'new@test.ro', password: 'password123', displayName: 'Test User' })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with loading true then resolves to unauthenticated', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('login sets user and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('user')).not.toHaveTextContent('none');
    expect(localStorage.getItem('refind_user')).toBeTruthy();
  });

  it('register sets user and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await user.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
  });

  it('logout clears user and localStorage', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Login first
    await user.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Then logout
    await user.click(screen.getByText('Logout'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorage.getItem('refind_user')).toBeNull();
  });

  it('restores user from localStorage on mount', async () => {
    const storedUser = {
      id: 'demo-1',
      email: 'stored@test.ro',
      displayName: 'Stored User',
      avatarInitial: 'S',
      communityScore: 50,
      isVerified: false,
      role: 'user',
    };
    localStorage.setItem('refind_user', JSON.stringify(storedUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('Stored User');
  });

  it('throws when useAuth is used outside provider', () => {
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within AuthProvider');
  });
});
