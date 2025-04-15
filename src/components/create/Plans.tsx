import React, { useEffect, useState } from 'react';
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
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useGetBenefitClassStructuresQuery } from '../../store/apis/benefitClassApi';
import { useGetLimitStructuresQuery } from '../../store/apis/limitApi';

interface PlanAttributes {
  name: string;
  effectiveDate: Date | null;
  classStructureId: string;
  limitStructureId: string;
  marketSegment: string;
  productType: string;
  coverageType: string;
  innTiers: number;
  oonCoverage: boolean;
}

const Plans: React.FC = () => {
  const [attributes, setAttributes] = useState<PlanAttributes>({
    name: '',
    effectiveDate: new Date(),
    classStructureId: '',
    limitStructureId: '',
    marketSegment: 'Small',
    productType: 'PPO',
    coverageType: 'Both',
    innTiers: 1,
    oonCoverage: true,
  });

  // Fetch benefit class structures and limit structures
  const {
    data: classStructures,
    isLoading: isLoadingClassStructures,
    error: classStructuresError,
  } = useGetBenefitClassStructuresQuery();

  const {
    data: limitStructures,
    isLoading: isLoadingLimitStructures,
    error: limitStructuresError,
  } = useGetLimitStructuresQuery();

  const handleChange = (field: keyof PlanAttributes) => (event: any) => {
    setAttributes((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setAttributes((prev) => ({
      ...prev,
      effectiveDate: date,
    }));
  };

  // Filter class structures based on effective date, market segment, and product type
  const filteredClassStructures = classStructures?.filter((structure) => {
    if (!attributes.effectiveDate) return false;

    const structureDate = new Date(structure.effectiveDate);
    const selectedDate = new Date(attributes.effectiveDate);

    // Format dates to compare only year, month, day
    const structureDateStr = format(structureDate, 'yyyy-MM-dd');
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    return (
      structureDateStr === selectedDateStr &&
      (attributes.marketSegment === '' || structure.marketSegment === attributes.marketSegment) &&
      (attributes.productType === '' || structure.productType === attributes.productType)
    );
  });

  // Filter limit structures based on selected class structure
  const filteredLimitStructures = limitStructures?.filter((structure) => {
    if (!attributes.classStructureId) return false;

    const selectedClassStructure = classStructures?.find(
      (cs) => cs._id === attributes.classStructureId
    );
    if (!selectedClassStructure) return false;

    const structureDate = new Date(structure.effectiveDate);
    const selectedDate = new Date(selectedClassStructure.effectiveDate);

    // Format dates to compare only year, month, day
    const structureDateStr = format(structureDate, 'yyyy-MM-dd');
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    return (
      structureDateStr === selectedDateStr &&
      structure.marketSegment === selectedClassStructure.marketSegment &&
      structure.productType === selectedClassStructure.productType
    );
  });

  // Reset dependent fields when parent fields change
  useEffect(() => {
    setAttributes((prev) => ({
      ...prev,
      classStructureId: '',
      limitStructureId: '',
    }));
  }, [attributes.effectiveDate, attributes.marketSegment, attributes.productType]);

  useEffect(() => {
    setAttributes((prev) => ({
      ...prev,
      limitStructureId: '',
    }));
  }, [attributes.classStructureId]);

  const handleSwitchChange =
    (field: keyof PlanAttributes) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setAttributes((prev) => ({
        ...prev,
        [field]: event.target.checked,
      }));
    };

  return (
    <Box sx={{ pt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Plan Configuration
      </Typography>
      <Grid container spacing={3}>
        {/* Plan Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Plan Name"
                    value={attributes.name}
                    onChange={(e) => setAttributes((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Effective Date"
                      value={attributes.effectiveDate}
                      onChange={handleDateChange}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Class Structure</InputLabel>
                    <Select
                      value={attributes.classStructureId}
                      label="Class Structure"
                      onChange={handleChange('classStructureId')}
                      disabled={isLoadingClassStructures || !filteredClassStructures?.length}
                    >
                      {isLoadingClassStructures ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                          Loading...
                        </MenuItem>
                      ) : filteredClassStructures?.length ? (
                        filteredClassStructures.map((structure) => (
                          <MenuItem key={structure._id} value={structure._id}>
                            {structure.name} ({structure.numberOfClasses} classes)
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          No class structures available for the selected criteria
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Limit Structure</InputLabel>
                    <Select
                      value={attributes.limitStructureId}
                      label="Limit Structure"
                      onChange={handleChange('limitStructureId')}
                      disabled={
                        isLoadingLimitStructures ||
                        !filteredLimitStructures?.length ||
                        !attributes.classStructureId
                      }
                    >
                      {isLoadingLimitStructures ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                          Loading...
                        </MenuItem>
                      ) : filteredLimitStructures?.length ? (
                        filteredLimitStructures.map((structure) => (
                          <MenuItem key={structure._id} value={structure._id}>
                            {structure.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {attributes.classStructureId
                            ? 'No compatible limit structures available'
                            : 'Select a class structure first'}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                {(classStructuresError || limitStructuresError) && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      Error loading structures. Please try again later.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
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
                      disabled={
                        !attributes.name ||
                        !attributes.effectiveDate ||
                        !attributes.classStructureId ||
                        !attributes.limitStructureId
                      }
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
