import React from 'react';
import { DialogActions, Button } from '@mui/material';
import { CheckIcon as DoneIcon, CancelIcon } from './icons';

interface ConfirmationButtonsProps {
  onDone: () => void;
  onCancel: () => void;
}

export const ConfirmationButtons: React.FC<ConfirmationButtonsProps> = ({ onDone, onCancel }) => (
  <DialogActions>
    <Button onClick={onDone} color="primary" startIcon={<DoneIcon />}>
      Done
    </Button>
    <Button onClick={onCancel} color="primary" startIcon={<CancelIcon />}>
      Cancel
    </Button>
  </DialogActions>
);
