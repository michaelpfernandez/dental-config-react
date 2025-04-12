import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
} from '@mui/material';
import { useCreateLimitStructureMutation } from '../../store/apis/limitApi';
import { MarketSegment } from '../../types/enums';
import { getDisplayName } from '../../types/displayNames';
import { UnitType, LimitIntervalType } from '../../types/enums';

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
  const [isDirty, setIsDirty] = useState(false);

  // Redux mutation hooks
  const [createLimit] = useCreateLimitStructureMutation();

  // Form state
  const [limits, setLimits] = useState({
    annualMax: 1500,
    deductibleIndividual: 50,
    deductibleFamily: 150,
    waitingPeriodBasic: 0,
    waitingPeriodMajor: 12,
  });

  const [marketSegment, setMarketSegment] = useState(MarketSegment.Large);

  useEffect(() => {
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    // This effect is intentionally empty as we're not using any state here
  }, [isDirty]);

  // Function to prepare the payload for the API
  const preparePayload = () => {
    return {
      name: 'Default Limit Structure',
      effectiveDate: new Date().toISOString().split('T')[0],
      marketSegment: marketSegment,
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

    setLimits((prev) => ({
      ...prev,
      [field]: value,
    }));

    setIsDirty(true);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);

      // Validate required fields
      if (!limits.annualMax) {
        throw new Error('Annual maximum is required');
      }

      // Prepare the payload
      const payload = preparePayload();

      // Call the API
      const result = await createLimit(payload).unwrap();
      if (result) {
        setIsDirty(false);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save limit structure';
      setError(errorMessage);
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

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setLimits({
                  annualMax: 1500,
                  deductibleIndividual: 50,
                  deductibleFamily: 150,
                  waitingPeriodBasic: 0,
                  waitingPeriodMajor: 12,
                });
                setIsDirty(false);
                setError(null);
              }}
              disabled={!isDirty}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={!isDirty}>
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Limits;
