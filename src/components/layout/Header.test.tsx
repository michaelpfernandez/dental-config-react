import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { AuthProvider } from '../../contexts/AuthContext';

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

describe('Header Component', () => {
  const mockOnMenuSelect = vi.fn();

  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Header onMenuSelect={mockOnMenuSelect} />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders the header with correct title', () => {
    renderHeader();
    expect(screen.getByText('Dental Plan Configuration')).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays the Create dropdown menu when authenticated', () => {
    // Set up authenticated state
    localStorageMock.setItem(
      'dental_user',
      JSON.stringify({
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );

    renderHeader();

    // Click on the Create button
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    // Check if dropdown menu items are displayed
    expect(screen.getByRole('menuitem', { name: /patient/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /appointment/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /treatment/i })).toBeInTheDocument();
  });

  it('calls onMenuSelect with the correct menu item when clicked', () => {
    // Set up authenticated state
    localStorageMock.setItem(
      'dental_user',
      JSON.stringify({
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );

    renderHeader();

    // Open the Create dropdown
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    // Click on a menu item
    const patientMenuItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(patientMenuItem);

    // Check if onMenuSelect was called with the correct parameter
    expect(mockOnMenuSelect).toHaveBeenCalledWith('create-patient');
  });

  it('handles user menu and logout correctly', async () => {
    // Set up authenticated state
    localStorageMock.setItem(
      'dental_user',
      JSON.stringify({
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );

    renderHeader();

    // Find and click the user menu button (avatar)
    const userMenuButton = screen.getByRole('button', { name: /U/i }); // Matches the avatar text
    fireEvent.click(userMenuButton);

    // Click logout in the menu
    const logoutMenuItem = screen.getByRole('menuitem', { name: /logout/i });
    fireEvent.click(logoutMenuItem);

    // Check if localStorage was cleared and navigation occurred
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dental_user');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
