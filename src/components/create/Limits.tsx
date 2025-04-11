import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useActionBar } from '../../context/ActionBarContext';
import { useCreateLimitStructureMutation } from '../../store/apis/limitApi';
import { MarketSegment, ProductType, LimitIntervalType, UnitType } from '../../types/enums';
import { getDisplayName } from '../../types/displayNames';
import { SaveButtons } from '../benefit-classes/common/SaveButtons';

interface LimitOption {
  value: number | string;
  label: string;
  unit?: string;
}

const annualMaxOptions: LimitOption[] = [
  { value: 1000, label: '$1,000', unit: 'year' },
  { value: 1500, label: '$1,500', unit: 'year' },
  { value: 2000, label: '$2,000', unit: 'year' },
  { value: 'unlimited', label: 'Unlimited' },
];

const deductibleOptions: LimitOption[] = [
  { value: 0, label: 'No Deductible' },
  { value: 50, label: '$50' },
  { value: 100, label: '$100' },
];

const waitingPeriodOptions: LimitOption[] = [
  { value: 0, label: 'None' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: '12 Months' },
];

const Limits: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Get the action bar context
  const { setActions, clearActions } = useActionBar();

  // Redux mutation hooks
  const [createLimit, { isLoading: isCreating, error: mutationError }] =
    useCreateLimitStructureMutation();
  console.log('Mutation state:', { isCreating, mutationError });

  // Form state
  const [limits, setLimits] = useState({
    annualMax: 1500,
    deductibleIndividual: 50,
    deductibleFamily: 150,
    waitingPeriodBasic: 0,
    waitingPeriodMajor: 12,
  });

  const [marketSegment, setMarketSegment] = useState(MarketSegment.Large);

  // Set up action bar and track mutation state
  useEffect(() => {
    console.log('Setting up action bar with state:', { isCreating, isSaving, isDirty });
    setLoading(false);
    setError(null);

    // Update isSaving when mutation state changes
    setIsSaving(isCreating);

    console.log('Registering save button in action bar');
    // Set up the action bar buttons
    setActions([
      {
        id: 'save-button',
        component: (
          <SaveButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            disabled={!isDirty}
          />
        ),
      },
    ]);

    // Clear actions when component unmounts
    return () => clearActions();
  }, [setActions, clearActions, isCreating, isSaving, isDirty, handleSave, handleCancel]);

  useEffect(() => {
    console.log('Action bar effect running:', { isDirty, isSaving });
    // Always show the save buttons, but disable them when not dirty
    setActions([
      {
        id: 'save-limits',
        component: (
          <SaveButtons
            onSave={handleSave}
            onCancel={() => {
              setIsDirty(false);
              setError(null);
            }}
            isSaving={isSaving}
            disabled={!isDirty}
          />
        ),
      },
    ]);

    return () => {
      clearActions();
    };
  }, [isDirty, setActions, clearActions, handleSave, isSaving]);

  // Handle canceling changes
  const handleCancel = () => {
    // Reset to initial state
    setLimits({
      annualMax: 1500,
      deductibleIndividual: 50,
      deductibleFamily: 150,
      waitingPeriodBasic: 0,
      waitingPeriodMajor: 12,
    });
    setIsDirty(false);
    setError(null);
  };

  // Function to prepare the payload for the API
  const preparePayload = () => {
    return {
      name: 'Default Limit Structure',
      effectiveDate: new Date().toISOString().split('T')[0],
      marketSegment: marketSegment,
      productType: ProductType.PPO,
      limits: [
        {
          id: 'annual-max',
          classId: 'all',
          className: 'All Classes',
          benefitId: 'all',
          benefitName: 'All Benefits',
          quantity: limits.annualMax,
          unit: UnitType.N_A,
          interval: { type: LimitIntervalType.PerYear, value: 1 },
        },
      ],
    };
  };

  const handleChange = (field: string) => (event: any) => {
    const value = event.target.value;
    console.log(`Changing ${field} to:`, value);

    setLimits((prev) => ({
      ...prev,
      [field]: value,
    }));

    setIsDirty(true);
    setError(null);
  };

  const handleSave = async () => {
    console.log('handleSave called');
    console.log('Component state at save:', { limits, isDirty, isCreating, isSaving });
    try {
      setIsSaving(true);
      setError(null);

      // Validate required fields
      if (!limits.annualMax) {
        throw new Error('Annual maximum is required');
      }

      // Prepare and log the payload
      const payload = preparePayload();
      console.log('Saving with payload:', payload);

      // Call the API
      console.log('Calling createLimit with payload:', payload);
      try {
        const result = await createLimit(payload).unwrap();
        console.log('Save successful:', result);
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw apiError;
      }

      // Update UI state
      setIsDirty(false);
      alert('Limit structure saved successfully!');
    } catch (err) {
      console.error('Error in handleSave:', err);
      console.log('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
      });

      // Extract error message
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes('validation failed')) {
          const validationMessage = errorMessage.split('validation failed: ')[1];
          if (validationMessage) {
            errorMessage = `Validation error: ${validationMessage}`;
          }
        }
      }
      console.error('Save failed:', errorMessage);
      setError(errorMessage);
      alert(`Error saving limit structure: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ pt: 3 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Typography variant="h5" gutterBottom>
        Plan Limits
      </Typography>
      <Grid container spacing={3}>
        {/* Annual Maximum */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Annual Maximum
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Adult Annual Maximum</InputLabel>
                    <Select
                      value={limits.annualMax}
                      label="Adult Annual Maximum"
                      onChange={handleChange('annualMax')}
                    >
                      {annualMaxOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Pediatric benefits are always unlimited
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Deductibles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Deductibles
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Individual Deductible</InputLabel>
                    <Select
                      value={limits.deductibleIndividual}
                      label="Individual Deductible"
                      onChange={handleChange('deductibleIndividual')}
                    >
                      {deductibleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Family Deductible</InputLabel>
                    <Select
                      value={limits.deductibleFamily}
                      label="Family Deductible"
                      onChange={handleChange('deductibleFamily')}
                    >
                      {deductibleOptions.map((option) => {
                        const value = typeof option.value === 'number' ? option.value * 3 : 0;
                        return (
                          <MenuItem key={option.value} value={value}>
                            {option.label === 'No Deductible' ? option.label : `$${value}`}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Segment */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market Segment
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Market Segment</InputLabel>
                    <Select
                      value={marketSegment}
                      onChange={(e) => setMarketSegment(e.target.value as MarketSegment)}
                      label="Market Segment"
                    >
                      {Object.values(MarketSegment).map((segment) => (
                        <MenuItem key={segment} value={segment}>
                          {getDisplayName.marketSegment(segment)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Waiting Periods */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Waiting Periods
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Basic Services</InputLabel>
                    <Select
                      value={limits.waitingPeriodBasic}
                      label="Basic Services"
                      onChange={handleChange('waitingPeriodBasic')}
                    >
                      {waitingPeriodOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Major Services</InputLabel>
                    <Select
                      value={limits.waitingPeriodMajor}
                      label="Major Services"
                      onChange={handleChange('waitingPeriodMajor')}
                    >
                      {waitingPeriodOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Limits;
