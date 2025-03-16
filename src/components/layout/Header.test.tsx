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

    // Find and click the user menu button
    const userMenuButton = screen.getByRole('button', { name: 'Account settings' });
    fireEvent.click(userMenuButton);

    // Click logout in the menu
    const logoutMenuItem = screen.getByRole('menuitem', { name: /logout/i });
    fireEvent.click(logoutMenuItem);

    // Check if localStorage was cleared and navigation occurred
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dental_user');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays Find menu items and handles selection', () => {
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

    // Click on the Find button
    const findButton = screen.getByRole('button', { name: /find/i });
    fireEvent.click(findButton);

    // Check if Find dropdown menu items are displayed
    expect(screen.getByRole('menuitem', { name: /patient/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /appointment/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /treatment/i })).toBeInTheDocument();

    // Click on a Find menu item
    const findPatientMenuItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(findPatientMenuItem);

    // Check if onMenuSelect was called with the correct parameter
    expect(mockOnMenuSelect).toHaveBeenCalledWith('find-patient');
  });

  it('displays user information correctly in user menu', () => {
    // Set up authenticated state with role
    localStorageMock.setItem(
      'dental_user',
      JSON.stringify({
        username: 'admin',
        fullName: 'John Doe',
        roleId: '1',
      })
    );

    renderHeader();

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: 'Account settings' });
    fireEvent.click(userMenuButton);

    // Check user information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles menu item selection in Find menu', () => {
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

    // Find and click the Find button
    const findButton = screen.getByText('Find');
    fireEvent.click(findButton);

    // Click on a Find menu item
    const findPatientMenuItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(findPatientMenuItem);

    // Check if onMenuSelect was called with the correct parameter
    expect(mockOnMenuSelect).toHaveBeenCalledWith('find-patient');
  });

  it('handles menu closing when clicking outside', async () => {
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

    // Open Create menu
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Verify menu items are displayed
    expect(screen.getByRole('menuitem', { name: /patient/i })).toBeInTheDocument();

    // Click outside to close menu
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);

    // Verify menu is closed
    expect(screen.queryByRole('menuitem', { name: /patient/i })).not.toBeInTheDocument();
  });

  it('handles menu anchor element updates', () => {
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

    // Test Create menu
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    expect(screen.getByRole('menuitem', { name: /patient/i })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);

    // Test Find menu
    const findButton = screen.getByText('Find');
    fireEvent.click(findButton);
    expect(screen.getByRole('menuitem', { name: /patient/i })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);

    // Test user menu
    const userButton = screen.getByLabelText(/account settings/i);
    fireEvent.click(userButton);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
  });

  it('handles menu closing functions', () => {
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

    // Test Create menu closing
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    expect(screen.getByRole('menuitem', { name: /patient/i })).toBeInTheDocument();
    const createMenuItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(createMenuItem);
    expect(screen.queryByRole('menuitem', { name: /patient/i })).not.toBeInTheDocument();

    // Test Find menu closing
    const findButton = screen.getByText('Find');
    fireEvent.click(findButton);
    expect(screen.getByRole('menuitem', { name: /patient/i })).toBeInTheDocument();
    const findMenuItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(findMenuItem);
    expect(screen.queryByRole('menuitem', { name: /patient/i })).not.toBeInTheDocument();

    // Test user menu closing
    const userButton = screen.getByLabelText(/account settings/i);
    fireEvent.click(userButton);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('handles menu item clicks', () => {
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

    // Test Create menu item click
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    const createPatientItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(createPatientItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith('create-patient');

    // Test Find menu item click
    const findButton = screen.getByText('Find');
    fireEvent.click(findButton);
    const findPatientItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(findPatientItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith('find-patient');
  });

  it('handles menu state management', () => {
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

    // Test Create menu
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    const patientCreateItem = screen.getByRole('menuitem', { name: /patient/i });
    expect(patientCreateItem).toBeInTheDocument();

    // Test menu item selection closes menu
    fireEvent.click(patientCreateItem);
    expect(screen.queryByRole('menuitem', { name: /patient/i })).not.toBeInTheDocument();

    // Test Find menu
    const findButton = screen.getByText('Find');
    fireEvent.click(findButton);
    const patientFindItem = screen.getByRole('menuitem', { name: /patient/i });
    expect(patientFindItem).toBeInTheDocument();

    // Test that opening user menu closes Find menu
    const userButton = screen.getByLabelText(/account settings/i);
    fireEvent.click(userButton);
    expect(screen.queryByRole('menuitem', { name: /patient/i })).not.toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('handles menu item selection', () => {
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

    // Test Create menu items
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Test each menu item
    const patientItem = screen.getByRole('menuitem', { name: /patient/i });
    fireEvent.click(patientItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith('create-patient');
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();

    // Open menu again
    fireEvent.click(createButton);
    const appointmentItem = screen.getByRole('menuitem', { name: /appointment/i });
    fireEvent.click(appointmentItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith('create-appointment');
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
