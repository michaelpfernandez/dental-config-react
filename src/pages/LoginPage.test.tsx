import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';

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

const renderLoginPage = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders login form with required fields', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLoginPage();

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    // HTML5 validation is used, so we don't show explicit error messages
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/^password \*/i);

    expect(usernameInput).toBeInvalid();
    expect(passwordInput).toBeInvalid();
  });

  it('successfully logs in with admin credentials', async () => {
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByLabelText(/^password \*/i), {
      target: { value: 'admin123' },
    });

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('shows error message for invalid credentials', async () => {
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByLabelText(/^password \*/i), {
      target: { value: 'wrong123' },
    });

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/^password \*/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
