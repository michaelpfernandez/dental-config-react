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
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { clientLogger } from '../../../utils/clientLogger';
import { useGetBenefitClassStructuresQuery } from '../../../store/apis/benefitClassApi';
import { useGetLimitStructuresQuery } from '../../../store/apis/limitApi';
import { MarketSegment, ProductType, CoverageType, NetworkTiers } from '../../../types/enums';
import { getEnumOptions } from '../../../utils/enumUtils';

interface PlanFormData {
  name: string;
  effectiveDate: string;
  classStructureId: string;
  classStructureName: string;
  limitStructureId: string;
  limitStructureName: string;
  marketSegment: string;
  productType: string;
  coverageType: string;
  innTiers: number;
  oonCoverage: boolean;
}

interface BenefitClassStructure {
  _id: string;
  name: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
  numberOfClasses: number;
}

interface LimitStructure {
  _id: string;
  name: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
}

const CreatePlanForm: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const defaultEffectiveDate = `${currentYear + 1}-01-01`;

  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    effectiveDate: defaultEffectiveDate,
    classStructureId: '',
    classStructureName: '',
    limitStructureId: '',
    limitStructureName: '',
    marketSegment: MarketSegment.Small,
    productType: ProductType.PPO,
    coverageType: CoverageType.Both,
    innTiers: NetworkTiers.SingleTier,
    oonCoverage: true,
  });

  const navigate = useNavigate();

  // Fetch benefit class structures and limit structures
  const {
    data: classStructures = [],
    isLoading: isLoadingClassStructures,
    error: classStructuresError,
  } = useGetBenefitClassStructuresQuery();

  const {
    data: limitStructures = [],
    isLoading: isLoadingLimitStructures,
    error: limitStructuresError,
  } = useGetLimitStructuresQuery();

  // Filter class structures based on effective date, market segment, and product type
  // Filter class structures based on form data
  const filteredClassStructures = classStructures.filter(
    (structure: BenefitClassStructure) =>
      (!formData.marketSegment || structure.marketSegment === formData.marketSegment) &&
      (!formData.productType || structure.productType === formData.productType) &&
      (!formData.effectiveDate || structure.effectiveDate === formData.effectiveDate)
  );

  // Reset class and limit structures when effective date changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      classStructureId: '',
      classStructureName: '',
      limitStructureId: '',
      limitStructureName: '',
    }));
  }, [formData.effectiveDate]);

  // Get selected class structure
  const selectedClassStructure = formData.classStructureId
    ? classStructures.find((cs: BenefitClassStructure) => cs._id === formData.classStructureId)
    : null;

  // Filter limit structures based on selected class structure
  const filteredLimitStructures = selectedClassStructure
    ? limitStructures.filter(
        (structure: LimitStructure) =>
          structure.effectiveDate === selectedClassStructure.effectiveDate &&
          structure.marketSegment === selectedClassStructure.marketSegment &&
          structure.productType === selectedClassStructure.productType
      )
    : [];

  const handleChange = (field: keyof PlanFormData) => (event: any) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If selecting a benefit class structure, update the name and reset limit structure
    if (field === 'classStructureId') {
      const selectedStructure = classStructures.find(
        (structure: BenefitClassStructure) => structure._id === value
      );

      if (selectedStructure) {
        setFormData((prev) => ({
          ...prev,
          classStructureName: selectedStructure.name,
          limitStructureId: '',
          limitStructureName: '',
        }));
      } else if (value === '') {
        // Reset limit structure if class structure is cleared
        setFormData((prev) => ({
          ...prev,
          limitStructureId: '',
          limitStructureName: '',
        }));
      }
    }

    // If selecting a limit structure, update the name
    if (field === 'limitStructureId') {
      const selectedStructure = limitStructures.find(
        (structure: LimitStructure) => structure._id === value
      );

      if (selectedStructure) {
        setFormData((prev) => ({
          ...prev,
          limitStructureName: selectedStructure.name,
        }));
      }
    }
  };

  const handleCreatePlan = async () => {
    try {
      // Validate form
      if (
        !formData.name ||
        !formData.effectiveDate ||
        !formData.classStructureId ||
        !formData.limitStructureId
      ) {
        return;
      }

      // TODO: Replace with actual API call to create plan
      // Proceed with plan creation

      // Simulate API call success
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to the plan configuration page
      const selectedClassStructure = classStructures.find(
        (cs: BenefitClassStructure) => cs._id === formData.classStructureId
      );
      const selectedLimitStructure = limitStructures.find(
        (ls: LimitStructure) => ls._id === formData.limitStructureId
      );
      navigate(`/plans/${formData.name}/configure`, {
        state: {
          ...formData,
          classStructure: selectedClassStructure,
          limitStructure: selectedLimitStructure,
        },
      });
    } catch (error) {
      clientLogger.info('Creating plan with data:', formData);
      // TODO: Show error message to user
      clientLogger.error('Error creating plan:', error);
    }
  };

  return (
    <Box sx={{ pt: 5, pb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Dental Plan
      </Typography>
      <Grid container spacing={2}>
        {/* Plan Details Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '16px' }}>
                Plan Details
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
                    <InputLabel>Plan Name</InputLabel>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={handleChange('name')}
                      inputProps={{ maxLength: 50 }}
                      style={{ width: '100%', height: '40px' }}
                      required
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  {isLoadingClassStructures ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : classStructuresError ? (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Error loading benefit class structures. Please try again later.
                    </Alert>
                  ) : (
                    <>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Class Structure</InputLabel>
                        <Select
                          value={formData.classStructureId}
                          label="Class Structure"
                          onChange={handleChange('classStructureId')}
                          disabled={filteredClassStructures.length === 0}
                        >
                          {filteredClassStructures.map((structure) => (
                            <MenuItem key={structure._id} value={structure._id}>
                              {structure.name} ({structure.numberOfClasses} classes)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {!isLoadingClassStructures && filteredClassStructures.length === 0 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          No matching class structures found. Please adjust your effective date.
                        </Alert>
                      )}
                    </>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {isLoadingLimitStructures ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : limitStructuresError ? (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Error loading limit structures. Please try again later.
                    </Alert>
                  ) : (
                    <>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Limit Structure</InputLabel>
                        <Select
                          value={formData.limitStructureId}
                          label="Limit Structure"
                          onChange={handleChange('limitStructureId')}
                          disabled={
                            !formData.classStructureId || filteredLimitStructures.length === 0
                          }
                        >
                          {filteredLimitStructures.map((structure) => (
                            <MenuItem key={structure._id} value={structure._id}>
                              {structure.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {!isLoadingLimitStructures &&
                        formData.classStructureId &&
                        filteredLimitStructures.length === 0 && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            No compatible limit structures found for the selected class structure.
                          </Alert>
                        )}
                    </>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right side cards */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Market & Product Card */}
            <Grid item xs={12}>
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
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              marketSegment: e.target.value,
                              classStructureId: '',
                              classStructureName: '',
                              limitStructureId: '',
                              limitStructureName: '',
                            }));
                          }}
                        >
                          {getEnumOptions(MarketSegment).map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Product Type</InputLabel>
                        <Select
                          value={formData.productType}
                          label="Product Type"
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              productType: e.target.value,
                              classStructureId: '',
                              classStructureName: '',
                              limitStructureId: '',
                              limitStructureName: '',
                            }));
                          }}
                        >
                          {getEnumOptions(ProductType).map((option) => (
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

            {/* Coverage & Network Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Coverage & Network
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Coverage Type</InputLabel>
                        <Select
                          value={formData.coverageType}
                          label="Coverage Type"
                          onChange={handleChange('coverageType')}
                        >
                          {getEnumOptions(CoverageType).map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Network Tiers</InputLabel>
                        <Select
                          value={formData.innTiers}
                          label="Network Tiers"
                          onChange={handleChange('innTiers')}
                        >
                          <MenuItem value={NetworkTiers.SingleTier}>Single Tier</MenuItem>
                          <MenuItem value={NetworkTiers.TwoTier}>Two Tier</MenuItem>
                          <MenuItem value={NetworkTiers.ThreeTier}>Three Tier</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.oonCoverage}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                oonCoverage: e.target.checked,
                              }))
                            }
                          />
                        }
                        label="Out-of-Network Coverage"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Summary Card - Full Width */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '16px' }}>
                <strong>Plan Summary</strong>
              </Typography>
              <Typography>
                <strong style={{ color: 'blue' }}>{formData.name || 'Unnamed Plan'}</strong> is a{' '}
                <strong style={{ color: 'blue' }}>{formData.marketSegment}</strong>{' '}
                <strong style={{ color: 'blue' }}>{formData.productType}</strong> plan with{' '}
                <strong style={{ color: 'blue' }}>{formData.coverageType}</strong> coverage,{' '}
                <strong style={{ color: 'blue' }}>
                  {formData.innTiers === 1
                    ? 'single tier'
                    : formData.innTiers === 2
                      ? 'two tier'
                      : 'three tier'}
                </strong>{' '}
                network
                {formData.oonCoverage && (
                  <>
                    {' '}
                    and <strong style={{ color: 'blue' }}>out-of-network coverage</strong>
                  </>
                )}{' '}
                effective on <strong style={{ color: 'blue' }}>{formData.effectiveDate}</strong>.
                {formData.classStructureName && (
                  <>
                    {' '}
                    Using class structure{' '}
                    <strong style={{ color: 'blue' }}>{formData.classStructureName}</strong>
                  </>
                )}
                {formData.limitStructureName && (
                  <>
                    {' '}
                    and limit structure{' '}
                    <strong style={{ color: 'blue' }}>{formData.limitStructureName}</strong>
                  </>
                )}
                .
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  onClick={() => navigate('/plans')}
                  variant="contained"
                  sx={{ mt: 2, mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={handleCreatePlan}
                  disabled={
                    !formData.name ||
                    !formData.effectiveDate ||
                    !formData.classStructureId ||
                    !formData.limitStructureId
                  }
                >
                  Create Plan
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreatePlanForm;
