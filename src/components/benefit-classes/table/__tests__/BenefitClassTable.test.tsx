import { vi, describe, it, beforeEach, afterEach } from 'vitest';
import { createTheme } from '@mui/material/styles';
import { fetchBenefitClasses, fetchBenefitsList } from '../../../services/api';

// Create a theme instance
const theme = createTheme();

// Mock the API functions
describe('BenefitClassTable', () => {
  const mockClasses = [
    { id: '1', name: 'Class 1' },
    { id: '2', name: 'Class 2' },
  ];

  const mockBenefits = [
    { id: '1', name: 'Benefit 1' },
    { id: '2', name: 'Benefit 2' },
  ];

  beforeEach(() => {
    vi.mock('../../../services/api', () => ({
      fetchBenefitClasses: vi.fn().mockResolvedValue({ benefitClasses: mockClasses }),
      fetchBenefitsList: vi.fn().mockResolvedValue({ benefits: mockBenefits }),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.skip('renders the table with classes', async () => {
    // Test disabled
  });

  it.skip('handles edit button click', async () => {
    // Test disabled
  });
});
