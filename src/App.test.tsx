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

  const loginAsAdmin = async () => {
    localStorageMock.setItem(
      'dental_user',
      JSON.stringify({
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );
    // Wait for auth state to update
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Authentication Flow', () => {
    it('redirects to login page when accessing protected route without auth', async () => {
      renderApp('/');
      expect(await screen.findByText(/dental plan login/i)).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('redirects to login page when accessing invalid route without auth', async () => {
      renderApp('/invalid-route');
      expect(await screen.findByText(/dental plan login/i)).toBeInTheDocument();
    });

    it('allows access to home page when authenticated', async () => {
      await loginAsAdmin();
      renderApp('/');
      expect(await screen.findByText(/welcome to dental plan configuration/i)).toBeInTheDocument();
    });
  });

  describe('Login Page', () => {
    it('shows test account information', async () => {
      renderApp('/login');
      expect(await screen.findByText(/available test accounts/i)).toBeInTheDocument();
      expect(await screen.findByText(/admin.*admin123/i)).toBeInTheDocument();
      expect(await screen.findByText(/dentist.*dentist123/i)).toBeInTheDocument();
    });

    it('shows required form fields', async () => {
      renderApp('/login');
      expect(await screen.findByLabelText(/username/i)).toBeInTheDocument();
      expect(await screen.findByLabelText(/^password \*/i)).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('stays on login page when already on it', async () => {
      renderApp('/login');
      expect(await screen.findByText(/dental plan login/i)).toBeInTheDocument();
    });
  });

  describe('Error Pages', () => {
    it('shows unauthorized page on direct access', async () => {
      renderApp('/unauthorized');
      expect(await screen.findByText(/access denied/i)).toBeInTheDocument();
      expect(
        await screen.findByText(/you don't have permission to access this page/i)
      ).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /return to home/i })).toBeInTheDocument();
    });

    it('redirects authenticated user to home on invalid route', async () => {
      await loginAsAdmin();
      renderApp('/invalid-route');
      expect(await screen.findByText(/welcome to dental plan configuration/i)).toBeInTheDocument();
    });
  });
});
