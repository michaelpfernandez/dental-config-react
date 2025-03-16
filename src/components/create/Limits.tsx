import React from 'react';
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
} from '@mui/material';

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
  const [limits, setLimits] = React.useState({
    annualMax: 1500,
    deductibleIndividual: 50,
    deductibleFamily: 150,
    waitingPeriodBasic: 0,
    waitingPeriodMajor: 12,
  });

  const handleChange = (field: string) => (event: any) => {
    setLimits((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <Box sx={{ pt: 3 }}>
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
