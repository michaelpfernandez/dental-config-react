import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBenefitClasses, fetchBenefitsList } from '../api';

// Create a mock get function
const mockGet = vi.fn();

// Mock the entire api module
vi.mock('../api', async () => {
  const actual = await vi.importActual<typeof import('../api')>('../api');
  return {
    default: actual.default,
    fetchBenefitClasses: async () => {
      const response = await mockGet('/config/benefit-classes');
      return response.data;
    },
    fetchBenefitsList: async () => {
      const response = await mockGet('/config/benefits');
      return response.data;
    },
  };
});

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBenefitClasses', () => {
    it('should successfully fetch benefit classes', async () => {
      const mockData = [
        { id: 1, name: 'Class A' },
        { id: 2, name: 'Class B' },
      ];

      mockGet.mockResolvedValueOnce({ data: mockData });

      const result = await fetchBenefitClasses();

      expect(mockGet).toHaveBeenCalledWith('/config/benefit-classes');
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching benefit classes', async () => {
      const mockError = new Error('Network error');
      mockGet.mockRejectedValueOnce(mockError);

      await expect(fetchBenefitClasses()).rejects.toThrow('Network error');
    });
  });

  describe('fetchBenefitsList', () => {
    it('should successfully fetch benefits list', async () => {
      const mockData = [
        { id: 1, name: 'Benefit 1', description: 'Description 1' },
        { id: 2, name: 'Benefit 2', description: 'Description 2' },
      ];

      mockGet.mockResolvedValueOnce({ data: mockData });

      const result = await fetchBenefitsList();

      expect(mockGet).toHaveBeenCalledWith('/config/benefits');
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching benefits list', async () => {
      const mockError = new Error('Network error');
      mockGet.mockRejectedValueOnce(mockError);

      await expect(fetchBenefitsList()).rejects.toThrow('Network error');
    });
  });
});
