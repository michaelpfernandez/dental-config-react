import React from 'react';
import { clientLogger } from '../../utils/clientLogger';
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
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';

interface PlanAttributes {
  marketSegment: string;
  productType: string;
  coverageType: string;
  innTiers: number;
  oonCoverage: boolean;
}

const Plans: React.FC = () => {
  const [attributes, setAttributes] = React.useState<PlanAttributes>({
    marketSegment: 'Small',
    productType: 'PPO',
    coverageType: 'Both',
    innTiers: 1,
    oonCoverage: true,
  });

  const handleChange = (field: keyof PlanAttributes) => (event: any) => {
    setAttributes((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange =
    (field: keyof PlanAttributes) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setAttributes((prev) => ({
        ...prev,
        [field]: event.target.checked,
      }));
    };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Plan Configuration
      </Typography>
      <Grid container spacing={3}>
        {/* Market & Product */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market & Product
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Market Segment</InputLabel>
                    <Select
                      value={attributes.marketSegment}
                      label="Market Segment"
                      onChange={handleChange('marketSegment')}
                    >
                      <MenuItem value="Small">Small Group</MenuItem>
                      <MenuItem value="Individual">Individual</MenuItem>
                      <MenuItem value="Large">Large Group</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Product Type</InputLabel>
                    <Select
                      value={attributes.productType}
                      label="Product Type"
                      onChange={handleChange('productType')}
                    >
                      <MenuItem value="PPO">PPO</MenuItem>
                      <MenuItem value="DHMO">DHMO</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Coverage & Network */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Coverage & Network
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Coverage Type</InputLabel>
                    <Select
                      value={attributes.coverageType}
                      label="Coverage Type"
                      onChange={handleChange('coverageType')}
                    >
                      <MenuItem value="Adult">Adult Only</MenuItem>
                      <MenuItem value="Pediatric">Pediatric Only</MenuItem>
                      <MenuItem value="Both">Both Adult & Pediatric</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Network Tiers</InputLabel>
                    <Select
                      value={attributes.innTiers}
                      label="Network Tiers"
                      onChange={handleChange('innTiers')}
                    >
                      <MenuItem value={1}>Single Tier</MenuItem>
                      <MenuItem value={2}>Two Tiers</MenuItem>
                      <MenuItem value={3}>Three Tiers</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={attributes.oonCoverage}
                        onChange={handleSwitchChange('oonCoverage')}
                      />
                    }
                    label="Out-of-Network Coverage"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary & Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    {attributes.marketSegment} {attributes.productType} Plan with{' '}
                    {attributes.coverageType} coverage,{' '}
                    {attributes.innTiers === 1
                      ? 'single tier'
                      : attributes.innTiers === 2
                        ? 'two tier'
                        : 'three tier'}{' '}
                    network
                    {attributes.oonCoverage ? ' and out-of-network coverage' : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        // Handle plan creation
                        clientLogger.info('Creating dental plan', { attributes });
                      }}
                    >
                      Create Plan
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Plans;
