import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { AuthProvider } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';

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

describe('HomePage Component', () => {
  const renderHomePage = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <AppLayout>
            <HomePage />
          </AppLayout>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders the welcome message correctly', () => {
    renderHomePage();
    expect(screen.getByText(/welcome to dental plan configuration/i)).toBeInTheDocument();
  });

  it('renders the initial content area with instructions', () => {
    renderHomePage();
    expect(
      screen.getByText(/please use the menu above to manage your dental plans/i)
    ).toBeInTheDocument();
  });

  it('shows authenticated content when user is logged in', () => {
    // Ensure local storage is set up correctly in tests
    localStorageMock.setItem(
      'dental_user',
      JSON.stringify({
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );

    renderHomePage();

    // Verify Create and Find buttons are visible
    const createButton = screen.getByRole('button', { name: /Create new dental plan/i });
    expect(createButton).toBeInTheDocument();

    const findButton = screen.getByRole('button', { name: /Find existing dental plans/i });
    expect(findButton).toBeInTheDocument();
  });
});
