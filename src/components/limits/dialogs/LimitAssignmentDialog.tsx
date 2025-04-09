import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { Limit, LimitInterval } from '../../../types/limitStructure';

interface LimitAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (limit: Limit) => void;
  limit: Limit;
  benefits: Array<{ id: string; name: string }>;
  isLoading: boolean;
}

const LimitAssignmentDialog: React.FC<LimitAssignmentDialogProps> = ({
  open,
  onClose,
  onSave,
  limit,
  benefits,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Limit>(limit);

  useEffect(() => {
    setFormData(limit);
  }, [limit]);

  const handleBenefitChange = (event: SelectChangeEvent) => {
    const benefitId = event.target.value;
    const benefitName = benefits.find((b) => b.id === benefitId)?.name || '';

    setFormData({
      ...formData,
      benefitId,
      benefitName,
    });
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(event.target.value, 10) || 0;
    setFormData({
      ...formData,
      quantity: Math.max(0, quantity), // Ensure quantity is not negative
    });
  };

  const handleIntervalTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as 'per_visit' | 'per_year' | 'per_lifetime';
    setFormData({
      ...formData,
      interval: {
        ...formData.interval,
        type,
      },
    });
  };

  const handleIntervalValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || 0;
    setFormData({
      ...formData,
      interval: {
        ...formData.interval,
        value: Math.max(1, value), // Ensure interval value is at least 1
      },
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isFormValid = () => {
    return (
      formData.benefitId &&
      formData.quantity > 0 &&
      formData.interval.type &&
      formData.interval.value > 0
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formData.id ? 'Edit Limit' : 'Add New Limit'}</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="benefit-select-label">Benefit</InputLabel>
              <Select
                labelId="benefit-select-label"
                id="benefit-select"
                value={formData.benefitId}
                label="Benefit"
                onChange={handleBenefitChange}
              >
                {benefits.map((benefit) => (
                  <MenuItem key={benefit.id} value={benefit.id}>
                    {benefit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleQuantityChange}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 1 } }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="interval-type-label">Interval Type</InputLabel>
              <Select
                labelId="interval-type-label"
                id="interval-type"
                value={formData.interval.type}
                label="Interval Type"
                onChange={handleIntervalTypeChange}
              >
                <MenuItem value="per_visit">Per Visit</MenuItem>
                <MenuItem value="per_year">Per Year</MenuItem>
                <MenuItem value="per_lifetime">Per Lifetime</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Interval Value"
              type="number"
              value={formData.interval.value}
              onChange={handleIntervalValueChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!isFormValid() || isLoading}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LimitAssignmentDialog;
