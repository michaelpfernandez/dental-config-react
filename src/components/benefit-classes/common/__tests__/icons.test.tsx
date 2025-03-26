import React from 'react';
import { render, screen } from '@testing-library/react';
import { EditIcon, ClearIcon, CheckIcon, CancelIcon, SaveIcon } from '../icons';

describe('Material-UI Icons', () => {
  it('renders EditIcon', () => {
    render(<EditIcon />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders ClearIcon', () => {
    render(<ClearIcon />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders CheckIcon', () => {
    render(<CheckIcon />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders CancelIcon', () => {
    render(<CancelIcon />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders SaveIcon', () => {
    render(<SaveIcon />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
