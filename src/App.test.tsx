import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
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
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('App Component', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );
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
      renderWithRouter('/');
      expect(screen.getByText(/dental plan login/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('allows access to home page when authenticated', () => {
      loginAsAdmin();
      renderWithRouter('/');
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /find/i })).toBeInTheDocument();
    });

    it('redirects to login page when accessing invalid route without auth', () => {
      renderWithRouter('/invalid-route');
      expect(screen.getByText(/dental plan login/i)).toBeInTheDocument();
    });
  });

  describe('Login Page', () => {
    it('shows test account information', () => {
      renderWithRouter('/login');
      expect(screen.getByText(/available test accounts/i)).toBeInTheDocument();
      expect(screen.getByText(/admin \/.*admin123/i)).toBeInTheDocument();
      expect(screen.getByText(/dentist \/.*dentist123/i)).toBeInTheDocument();
    });

    it('shows required form fields', () => {
      renderWithRouter('/login');
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password \*/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('stays on login page when already on it', () => {
      renderWithRouter('/login');
      expect(screen.getByText(/dental plan login/i)).toBeInTheDocument();
    });
  });

  describe('Error Pages', () => {
    it('shows unauthorized page on direct access', () => {
      renderWithRouter('/unauthorized');
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(
        screen.getByText(/you don't have permission to access this page/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
    });

    it('redirects authenticated user to home on invalid route', () => {
      loginAsAdmin();
      renderWithRouter('/invalid-route');
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });
});
