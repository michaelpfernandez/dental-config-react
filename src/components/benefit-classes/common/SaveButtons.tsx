import React from 'react';
import { DialogActions, Button } from '@mui/material';
import { SaveIcon, CancelIcon } from './icons';

interface SaveButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export const SaveButtons: React.FC<SaveButtonsProps> = ({
  onSave,
  onCancel,
  isSaving = false,
  disabled = false,
}) => (
  <DialogActions>
    <Button
      onClick={onSave}
      color="primary"
      startIcon={<SaveIcon />}
      disabled={disabled || isSaving}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </Button>
    <Button onClick={onCancel} color="primary" startIcon={<CancelIcon />} disabled={isSaving}>
      Cancel
    </Button>
  </DialogActions>
);
