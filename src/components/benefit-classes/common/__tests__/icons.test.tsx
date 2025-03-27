import React from 'react';
import { render, screen } from '@testing-library/react';
import { EditIcon, ClearIcon, CheckIcon, CancelIcon, SaveIcon } from '../icons';

describe('Material-UI Icons', () => {
  it('renders EditIcon', () => {
    render(<EditIcon />);
    expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
  });

  it('renders ClearIcon', () => {
    render(<ClearIcon />);
    expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
  });

  it('renders CheckIcon', () => {
    render(<CheckIcon />);
    expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
  });

  it('renders CancelIcon', () => {
    render(<CancelIcon />);
    expect(screen.getByTestId('CancelIcon')).toBeInTheDocument();
  });

  it('renders SaveIcon', () => {
    render(<SaveIcon />);
    expect(screen.getByTestId('SaveIcon')).toBeInTheDocument();
  });
});
