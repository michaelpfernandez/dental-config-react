import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Mock localStorage
const mockStorage: { [key: string]: string } = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the auth context
const TestComponent = () => {
  const { currentUser, login, logout } = useAuth();

  return (
    <div>
      {currentUser ? (
        <>
          <div data-testid="user-info">
            {currentUser.username} - {currentUser.fullName}
          </div>
          <button onClick={logout} data-testid="logout-button">
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => login({ username: 'admin', password: 'admin123' })}
          data-testid="login-button"
        >
          Login
        </button>
      )}
    </div>
  );
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{component}</AuthProvider>
    </MemoryRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('provides initial unauthenticated state', () => {
    renderWithRouter(<TestComponent />);
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('successfully logs in with correct admin credentials', async () => {
    renderWithRouter(<TestComponent />);
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('admin - Admin User');
    });
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('successfully logs out', async () => {
    renderWithRouter(<TestComponent />);

    // Login first
    fireEvent.click(screen.getByTestId('login-button'));
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });

    // Then logout
    fireEvent.click(screen.getByTestId('logout-button'));
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
