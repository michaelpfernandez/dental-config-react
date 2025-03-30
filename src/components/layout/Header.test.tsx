import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { AuthProvider } from '../../contexts/AuthContext';
import { MENU_ITEMS } from '../../constants/menuItems';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  const mockedModule = { ...actual } as typeof import('react-router-dom');
  return {
    ...mockedModule,
    useNavigate: () => mockNavigate,
  };
});

const mockOnMenuSelect = vi.fn();

describe('Header Component', () => {
  const renderHeader = () => {
    return render(
      <MemoryRouter>
        ,
        <AuthProvider>
          ,
          <Header onMenuSelect={mockOnMenuSelect} />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the header with correct title', () => {
    renderHeader();
    expect(screen.getByText('Dental Plan Configuration')).toBeInTheDocument();
  });

  it('displays the Create dropdown menu when authenticated', () => {
    // Set up authenticated state
    localStorage.setItem(
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
    expect(screen.getByText('Benefit Class Structure')).toBeInTheDocument();
    expect(screen.getByText('Limits')).toBeInTheDocument();
    expect(screen.getByText('Plans')).toBeInTheDocument();
  });

  it('calls onMenuSelect with the correct menu item when clicked', () => {
    // Set up authenticated state
    localStorage.setItem(
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
    const benefitClassMenuItem = screen.getByText('Benefit Class Structure');
    fireEvent.click(benefitClassMenuItem);

    // Check if onMenuSelect was called with the correct parameter
    expect(mockOnMenuSelect).toHaveBeenCalledWith(MENU_ITEMS.CREATE_BENEFIT_CLASS);
  });

  it('handles user menu and logout correctly', async () => {
    // Set up authenticated state
    localStorage.setItem(
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
    expect(localStorage.getItem('dental_user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays user information correctly in user menu', () => {
    // Set up authenticated state with role
    localStorage.setItem(
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

  it('shows user menu when authenticated', () => {
    localStorage.setItem(
      'dental_user',
      JSON.stringify({
        id: '1',
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );

    renderHeader();
    const userMenu = screen.getByRole('button', { name: /account settings/i });
    expect(userMenu).toBeInTheDocument();
  });

  it('handles menu item selection in Create menu', () => {
    localStorage.setItem(
      'dental_user',
      JSON.stringify({
        id: '1',
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );

    renderHeader();

    // Test Create menu item click
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    const benefitClassItem = screen.getByText('Benefit Class Structure');
    fireEvent.click(benefitClassItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith(MENU_ITEMS.CREATE_BENEFIT_CLASS);

    const limitsItem = screen.getByText('Limits');
    fireEvent.click(limitsItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith(MENU_ITEMS.CREATE_LIMITS);

    const plansItem = screen.getByText('Plans');
    fireEvent.click(plansItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith(MENU_ITEMS.CREATE_PLAN);
  });

  it('handles menu item selection in Find menu', () => {
    localStorage.setItem(
      'dental_user',
      JSON.stringify({
        id: '1',
        username: 'admin',
        fullName: 'Admin User',
        roleId: '1',
      })
    );

    renderHeader();

    // Test Find menu item click
    const findButton = screen.getByText('Find');
    fireEvent.click(findButton);
    const benefitClassItem = screen.getByText('Benefit Class');
    fireEvent.click(benefitClassItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith(MENU_ITEMS.FIND_BENEFIT_CLASS);

    const limitsItem = screen.getByText('Limits');
    fireEvent.click(limitsItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith(MENU_ITEMS.FIND_LIMITS);

    const plansItem = screen.getByText('Plans');
    fireEvent.click(plansItem);
    expect(mockOnMenuSelect).toHaveBeenCalledWith(MENU_ITEMS.FIND_PLAN);
  });
});
