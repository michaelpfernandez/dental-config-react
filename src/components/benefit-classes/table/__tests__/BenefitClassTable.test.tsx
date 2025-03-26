import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BenefitClassTable from '../BenefitClassTable';

describe('BenefitClassTable', () => {
  const mockClasses = [
    { id: '1', name: 'Class 1' },
    { id: '2', name: 'Class 2' },
  ];

  const mockBenefits = [
    { id: '1', name: 'Benefit 1' },
    { id: '2', name: 'Benefit 2' },
  ];

  const mockFetchBenefitClasses = jest.fn();
  const mockFetchBenefitsList = jest.fn();

  beforeEach(() => {
    mockFetchBenefitClasses.mockResolvedValue(mockClasses);
    mockFetchBenefitsList.mockResolvedValue(mockBenefits);
  });

  it('renders the table with classes', async () => {
    render(<BenefitClassTable numberOfClasses={2} />);

    // Wait for the data to load
    await screen.findByText('Class 1');
    await screen.findByText('Class 2');

    expect(screen.getByText('Class 1')).toBeInTheDocument();
    expect(screen.getByText('Class 2')).toBeInTheDocument();
  });

  it('handles edit button click', async () => {
    render(<BenefitClassTable numberOfClasses={2} />);

    // Wait for the data to load
    await screen.findByText('Class 1');

    // Find and click the edit button
    const editButton = screen.getAllByRole('button')[0];
    fireEvent.click(editButton);

    // Verify the dialog opens
    expect(screen.getByText('Assign Benefits')).toBeInTheDocument();
  });
});
