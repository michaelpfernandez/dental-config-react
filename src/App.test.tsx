import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from './test/test-utils';
import App from './App';

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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('App Component', () => {
  const renderApp = (initialRoute = '/') => {
    return render(<App />, { initialRoute });
  };

  const loginAsAdmin = () => {
    localStorageMock.setItem(
      'dental_user',
      JSON.stringify({
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Authentication Flow', () => {
    it('redirects to login page when accessing protected route without auth', () => {
      renderApp('/');
      expect(screen.getByText(/dental plan login/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('allows access to home page when authenticated', () => {
      loginAsAdmin();
      renderApp('/');
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /find/i })).toBeInTheDocument();
    });

    it('redirects to login page when accessing invalid route without auth', () => {
      renderApp('/invalid-route');
      expect(screen.getByText(/dental plan login/i)).toBeInTheDocument();
    });
  });

  describe('Login Page', () => {
    it('shows test account information', () => {
      renderApp('/login');
      expect(screen.getByText(/available test accounts/i)).toBeInTheDocument();
      expect(screen.getByText(/admin \/.*admin123/i)).toBeInTheDocument();
      expect(screen.getByText(/dentist \/.*dentist123/i)).toBeInTheDocument();
    });

    it('shows required form fields', () => {
      renderApp('/login');
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password \*/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('stays on login page when already on it', () => {
      renderApp('/login');
      expect(screen.getByText(/dental plan login/i)).toBeInTheDocument();
    });
  });

  describe('Error Pages', () => {
    it('shows unauthorized page on direct access', () => {
      renderApp('/unauthorized');
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(
        screen.getByText(/you don't have permission to access this page/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
    });

    it('redirects authenticated user to home on invalid route', () => {
      loginAsAdmin();
      renderApp('/invalid-route');
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });
});
