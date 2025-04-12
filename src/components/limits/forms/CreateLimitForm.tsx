import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Input,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { LimitFormData } from '../../../types/limitStructure';
import { BenefitClassStructure } from '../../../types/benefitClassStructure';
import { useGetBenefitClassStructuresQuery } from '../../../store/apis/benefitClassApi';
import { MarketSegment, ProductType } from '../../../types/enums';

const CreateLimitForm: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const defaultEffectiveDate = `${currentYear + 1}-01-01`;

  const [formData, setFormData] = useState<LimitFormData>({
    name: '',
    effectiveDate: defaultEffectiveDate,
    marketSegment: MarketSegment.Individual,
    productType: ProductType.PPO,
    benefitClassStructureId: '',
    benefitClassStructureName: '',
  });

  const [filteredClassStructures, setFilteredClassStructures] = useState<BenefitClassStructure[]>(
    [],
  );

  // Fetch benefit class structures from the API
  const {
    data: availableClassStructures = [],
    isLoading,
    error: apiError,
  } = useGetBenefitClassStructuresQuery();

  // Filter class structures based on selected market segment, product type, and effective date
  useEffect(() => {
    if (availableClassStructures && availableClassStructures.length > 0) {
      const filtered = availableClassStructures.filter(
        (structure) =>
          (!formData.marketSegment || structure.marketSegment === formData.marketSegment) &&
          (!formData.productType || structure.productType === formData.productType) &&
          (!formData.effectiveDate || structure.effectiveDate === formData.effectiveDate),
      );

      setFilteredClassStructures(filtered);
    }
  }, [
    formData.marketSegment,
    formData.productType,
    formData.effectiveDate,
    availableClassStructures,
  ]);

  const handleChange = (field: keyof LimitFormData) => (event: any) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If selecting a benefit class structure, update the name as well
    if (field === 'benefitClassStructureId') {
      const selectedStructure = availableClassStructures.find(
        (structure) => structure._id === value,
      );
      if (selectedStructure) {
        setFormData((prev) => ({
          ...prev,
          benefitClassStructureName: selectedStructure.name,
        }));
      }
    }
  };

  const navigate = useNavigate();

  const handleCreateLimit = () => {
    // Validate form
    if (
      !formData.name ||
      !formData.marketSegment ||
      !formData.productType ||
      !formData.benefitClassStructureId
    ) {
      alert('Please fill in all required fields');
      return;
    }

    // Navigate to the limit structure page with the form data
    navigate('/limits/summary', { state: formData });
  };

  return (
    <Box sx={{ pt: 5, pb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Limit Structure
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom style={{ marginBottom: '16px' }}>
                        Limit Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel htmlFor="effective-date">Effective Date</InputLabel>
                            <Input
                              id="effective-date"
                              type="date"
                              required
                              value={formData.effectiveDate}
                              onChange={handleChange('effectiveDate')}
                              style={{ width: '100%', height: '40px' }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Limit Name</InputLabel>
                            <Input
                              type="text"
                              value={formData.name}
                              onChange={handleChange('name')}
                              inputProps={{ maxLength: 50 }}
                              style={{ width: '100%', height: '40px' }}
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Market & Product
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Market Segment</InputLabel>
                            <Select
                              value={formData.marketSegment}
                              label="Market Segment"
                              onChange={handleChange('marketSegment')}
                            >
                              <MenuItem value={MarketSegment.Small}>Small Group</MenuItem>
                              <MenuItem value={MarketSegment.Individual}>Individual</MenuItem>
                              <MenuItem value={MarketSegment.Large}>Large Group</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Product Type</InputLabel>
                            <Select
                              value={formData.productType}
                              label="Product Type"
                              onChange={handleChange('productType')}
                            >
                              <MenuItem value={ProductType.PPO}>PPO</MenuItem>
                              <MenuItem value={ProductType.DHMO}>DHMO</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Benefit Class Structure
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                          <CircularProgress />
                        </Box>
                      ) : apiError ? (
                        <Typography color="error" sx={{ mt: 1 }}>
                          Error loading benefit class structures. Please try again later.
                        </Typography>
                      ) : (
                        <>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Select Benefit Class Structure</InputLabel>
                            <Select
                              value={formData.benefitClassStructureId}
                              label="Select Benefit Class Structure"
                              onChange={handleChange('benefitClassStructureId')}
                              disabled={filteredClassStructures.length === 0}
                            >
                              {filteredClassStructures.map((structure) => (
                                <MenuItem key={structure._id} value={structure._id}>
                                  {structure.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {!isLoading && filteredClassStructures.length === 0 && (
                            <Typography color="error" sx={{ mt: 1 }}>
                              No matching benefit class structures found. Please adjust your market
                              segment, product type, or effective date.
                            </Typography>
                          )}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: '40px' }} />
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom style={{ marginBottom: '16px' }}>
                    <strong>Limit Structure Summary</strong>
                  </Typography>
                  <Typography>
                    <strong style={{ color: 'blue' }}>{formData.name}</strong> is a limit structure
                    for <strong style={{ color: 'blue' }}>{formData.marketSegment}</strong>{' '}
                    <strong style={{ color: 'blue' }}>{formData.productType}</strong> effective on{' '}
                    <strong style={{ color: 'blue' }}>{formData.effectiveDate}</strong>
                    {formData.benefitClassStructureName && (
                      <>
                        {' '}
                        using benefit class structure{' '}
                        <strong style={{ color: 'blue' }}>
                          {formData.benefitClassStructureName}
                        </strong>
                      </>
                    )}
                    .
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={handleCreateLimit}
                    >
                      Create Limit Structure
                    </Button>
                    <Button
                      onClick={() => navigate('/limits')}
                      variant="contained"
                      sx={{ mt: 2, ml: 2 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateLimitForm;
