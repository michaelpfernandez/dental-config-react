import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
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
  TextField,
  Card,
  CardContent,
  CardActions,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import EditableCard from '../../common/EditableCard';
import { CostShareType, COST_SHARE_CONFIG, CoverageType } from '../../../types/enums';
import { getEnumDisplayName } from '../../../utils/enumUtils';
import {
  Edit as EditIcon,
  Save as SaveOutlined,
  Cancel as CancelOutlined,
} from '@mui/icons-material';
import { ConfirmationButtons } from '../../benefit-classes/common/ConfirmationButtons';
import { useActionBar } from '../../../context/ActionBarContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetBenefitClassStructureByIdQuery } from '../../../store/apis/benefitClassApi';

interface CostShareValues {
  copayAmount?: number;
  coinsurancePercentage?: number;
}

interface ClassCostShare {
  classId: string;
  className: string;
  costShareType: CostShareType;
  values: CostShareValues;
  networkTier: number;
  coverageType: CoverageType;
}

const PlanConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActions } = useActionBar();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [planName, setPlanName] = useState('');
  const [savedPlanName, setSavedPlanName] = useState('');
  const [activeNetworkTier, setActiveNetworkTier] = useState(0);
  const [activeCoverageTab, setActiveCoverageTab] = useState(0);
  // Initialize with Adult as default, but this will be overridden by form data
  const [selectedCoverageType, setSelectedCoverageType] = useState<CoverageType>(
    CoverageType.Adult
  );
  const [isSaving, setIsSaving] = useState(false);
  const [classCostShares, setClassCostShares] = useState<ClassCostShare[]>([]);
  const [selectedClassStructure, setSelectedClassStructure] = useState<string>('');
  const [selectedLimitStructure, setSelectedLimitStructure] = useState<string>('');
  const [classStructures, setClassStructures] = useState<Array<{ id: string; name: string }>>([]);
  const [limitStructures, setLimitStructures] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingStructures, setIsLoadingStructures] = useState(false);
  const [networkTiers, setNetworkTiers] = useState(1); // Default to 1 network tier
  const [hasOONCoverage, setHasOONCoverage] = useState(false); // Default to no out-of-network coverage

  // Handle tab change with logging
  const handleCoverageTabChange = (event: React.SyntheticEvent, newValue: string) => {
    console.log('Tab changed to:', newValue);
    setActiveCoverageTab(parseInt(newValue));
  };

  // Get form data from router state
  const formData = location.state;
  console.log('Initial form data:', formData);

  // Fetch the detailed class structure using RTK Query
  const {
    data: detailedClassStructure,
    isLoading: isLoadingClassStructure,
    error: classStructureError,
  } = useGetBenefitClassStructureByIdQuery(formData?.classStructure?._id || '', {
    skip: !formData?.classStructure?._id,
  });

  // Log the detailed class structure
  useEffect(() => {
    if (detailedClassStructure) {
      console.log('Detailed Class Structure:', detailedClassStructure);
      console.log('Detailed Class Structure Classes:', detailedClassStructure.classes);
      console.log(
        'Detailed Class Structure Classes Length:',
        detailedClassStructure.classes?.length
      );
    }
  }, [detailedClassStructure]);

  // Initialize structures from form data
  useEffect(() => {
    console.log('Form Data:', formData);
    if (formData) {
      console.log('Class Structure:', formData.classStructure);
      console.log('Limit Structure:', formData.limitStructure);
      console.log('Class Structure Classes:', formData.classStructure?.classes);
      console.log('Class Structure Classes Type:', typeof formData.classStructure?.classes);
      console.log('Class Structure Classes Length:', formData.classStructure?.classes?.length);

      // Set selected structures
      setSelectedClassStructure(formData.classStructure?._id || '');
      setSelectedLimitStructure(formData.limitStructure?._id || '');

      // Set available structures (for now, just show the selected ones)
      setClassStructures(
        [
          formData.classStructure
            ? {
                id: formData.classStructure._id,
                name: formData.classStructure.name,
              }
            : null,
        ].filter(Boolean)
      );

      setLimitStructures(
        [
          formData.limitStructure
            ? {
                id: formData.limitStructure._id,
                name: formData.limitStructure.name,
              }
            : null,
        ].filter(Boolean)
      );
    }
  }, [formData]);

  // Initialize cost shares when detailed class structure is loaded
  // Initialize cost shares when detailed class structure is loaded
  useEffect(() => {
    // Skip if we don't have the detailed class structure yet
    if (!detailedClassStructure || !detailedClassStructure.classes) {
      console.warn('Detailed class structure or classes property is undefined');
      return;
    }

    // Handle both array and object formats for classes
    let classesArray = [];
    if (Array.isArray(detailedClassStructure.classes)) {
      classesArray = detailedClassStructure.classes;
    } else if (typeof detailedClassStructure.classes === 'object') {
      // Convert object to array if needed
      classesArray = Object.values(detailedClassStructure.classes);
    }

    console.log('Classes array for cost shares from detailed structure:', classesArray);

    if (classesArray.length === 0) {
      console.warn('No classes found in the detailed class structure');
      return;
    }

    // Create cost shares for each network tier and coverage type combination
    const initialCostShares = [];

    // Determine which coverage types to initialize based on the selected coverage type
    const coverageTypesToInitialize = [];
    if (selectedCoverageType === CoverageType.Adult) {
      coverageTypesToInitialize.push(CoverageType.Adult);
    } else if (selectedCoverageType === CoverageType.Pediatric) {
      coverageTypesToInitialize.push(CoverageType.Pediatric);
    } else if (selectedCoverageType === CoverageType.Both) {
      coverageTypesToInitialize.push(CoverageType.Adult, CoverageType.Pediatric);
    } else if (selectedCoverageType === CoverageType.Family) {
      coverageTypesToInitialize.push(CoverageType.Adult, CoverageType.Pediatric);
    }

    // Calculate the total number of tiers including OON if applicable
    const tiersCount = networkTiers || 1; // Default to 1 if not set
    const hasOON = hasOONCoverage || false; // Default to false if not set
    const totalTiers = tiersCount + (hasOON ? 1 : 0);

    console.log('Creating cost shares with:', {
      coverageTypes: coverageTypesToInitialize,
      networkTiers: tiersCount,
      hasOONCoverage: hasOON,
      totalTiers,
    });

    // Create cost shares for each combination
    for (let tier = 0; tier < totalTiers; tier++) {
      for (const coverageType of coverageTypesToInitialize) {
        classesArray.forEach((classItem: any) => {
          initialCostShares.push({
            classId: classItem._id,
            className: classItem.name,
            costShareType: CostShareType.NotCovered,
            values: {},
            networkTier: tier,
            coverageType: coverageType,
          });
        });
      }
    }

    console.log('Initial cost shares created from detailed structure:', initialCostShares);
    setClassCostShares(initialCostShares);
  }, [detailedClassStructure, selectedCoverageType, networkTiers, hasOONCoverage]);

  useEffect(() => {
    if (!formData) {
      navigate('/plans');
      return;
    }

    // Initialize state from form data
    setPlanName(formData.name);
    setSavedPlanName(formData.name);

    // Initialize network tiers and OON coverage from form data
    if (formData.innTiers) {
      setNetworkTiers(formData.innTiers);
      console.log('Setting network tiers from innTiers:', formData.innTiers);
    }

    if (formData.oonCoverage !== undefined) {
      setHasOONCoverage(formData.oonCoverage);
      console.log('Setting OON coverage from oonCoverage:', formData.oonCoverage);
    }

    // Log everything for debugging
    console.log('Raw form data:', formData);
    console.log('Coverage type from form:', formData.coverageType);
    console.log('CoverageType enum values:', CoverageType);
    console.log('Network tiers from innTiers:', formData.innTiers);
    console.log('Has OON coverage from oonCoverage:', formData.oonCoverage);

    // FORCE the coverage type to be 'Both' if that's what was passed
    if (formData.coverageType === 'Both' || formData.coverageType === CoverageType.Both) {
      console.log('FORCING coverage type to Both');
      setSelectedCoverageType(CoverageType.Both);
    } else {
      setSelectedCoverageType(formData.coverageType);
    }
  }, [formData, navigate]);

  useEffect(() => {
    if (!formData) {
      return;
    }

    setActions([
      {
        id: 'save',
        component: (
          <Button
            onClick={() => {
              setIsSaving(true);
              // TODO: Implement save logic
              setIsSaving(false);
            }}
            startIcon={<SaveOutlined />}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        ),
      },
      {
        id: 'cancel',
        component: (
          <Button
            onClick={() => navigate('/plans')}
            startIcon={<CancelOutlined />}
            disabled={isSaving}
          >
            Cancel
          </Button>
        ),
      },
    ]);

    // Cleanup
    return () => setActions([]);
  }, [formData, setActions, navigate, isSaving]);

  if (!formData) {
    return null;
  }

  // Extract values from form data
  const {
    effectiveDate,
    marketSegment,
    productType,
    // We already have state variables for network tiers and OON coverage
    // that are initialized from formData, so we don't need to destructure them here
    classStructure: classStructureSummary,
    limitStructure,
  } = formData;

  // Use the detailed class structure if available, otherwise fall back to the summary
  const classStructure = detailedClassStructure || classStructureSummary;

  // Debug class structure
  console.log('Using class structure in render:', classStructure);
  console.log('Class structure classes in render:', classStructure?.classes);
  console.log('Class structure classes length in render:', classStructure?.classes?.length);

  // Calculate number of network tiers
  // Use the state variables which were initialized from form data
  const totalTiers = networkTiers + (hasOONCoverage ? 1 : 0);

  // Generate network tier labels
  const getNetworkTierLabel = (index: number): string => {
    if (index < networkTiers) {
      return `Tier ${index + 1}`;
    }
    return 'Out of Network';
  };

  // Handle cost share type change
  const handleCostShareTypeChange = (classId: string, newType: CostShareType) => {
    // Determine which coverage type is currently active
    const currentCoverageType =
      activeCoverageTab === 0
        ? selectedCoverageType === CoverageType.Pediatric
          ? CoverageType.Pediatric
          : CoverageType.Adult
        : CoverageType.Pediatric;

    const updatedShares = classCostShares.map((share) =>
      share.classId === classId &&
      share.networkTier === activeNetworkTier &&
      share.coverageType === currentCoverageType
        ? { ...share, costShareType: newType }
        : share
    );
    setClassCostShares(updatedShares);
  };

  return (
    <Box>
      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Plan Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plan Name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Effective Date"
                type="date"
                value={effectiveDate}
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Market Segment" value={marketSegment} disabled={true} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Product Type" value={productType} disabled={true} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Network Configuration"
                value={`${networkTiers} tier${networkTiers > 1 ? 's' : ''}${hasOONCoverage ? ' + Out-of-Network' : ''}`}
                disabled={true}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Coverage Type"
                value={getEnumDisplayName(selectedCoverageType)}
                disabled={true}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Class Structure</InputLabel>
                <Select
                  value={selectedClassStructure}
                  onChange={(e) => setSelectedClassStructure(e.target.value)}
                  disabled={!isEditing}
                  label="Class Structure"
                >
                  {classStructures.map((structure) => (
                    <MenuItem key={structure.id} value={structure.id}>
                      {structure.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Limit Structure</InputLabel>
                <Select
                  value={selectedLimitStructure}
                  onChange={(e) => setSelectedLimitStructure(e.target.value)}
                  disabled={!isEditing || !selectedClassStructure}
                  label="Limit Structure"
                >
                  {limitStructures.map((structure) => (
                    <MenuItem key={structure.id} value={structure.id}>
                      {structure.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          {isEditing ? (
            <ConfirmationButtons
              onDone={() => {
                setSavedPlanName(planName);
                setIsEditing(false);
              }}
              onCancel={() => {
                setPlanName(savedPlanName);
                setIsEditing(false);
              }}
            />
          ) : (
            <Button variant="outlined" onClick={() => setIsEditing(true)} startIcon={<EditIcon />}>
              Edit
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Network and Coverage Type Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Network Tier Selection - Using ToggleButtonGroup */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Network Tier
            </Typography>
            <ToggleButtonGroup
              value={activeNetworkTier}
              exclusive
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  console.log('Changing network tier to:', newValue);
                  setActiveNetworkTier(newValue);
                  // Reset coverage tab when changing network tier
                  setActiveCoverageTab(0);
                }
              }}
              aria-label="Network tiers"
              color="primary"
              sx={{
                width: '100%',
                '& .MuiToggleButtonGroup-grouped': {
                  flex: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              {Array.from({ length: totalTiers }, (_, index) => (
                <ToggleButton key={index} value={index} aria-label={getNetworkTierLabel(index)}>
                  {getNetworkTierLabel(index)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Coverage Type Selection - Using ToggleButtonGroup */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Coverage Type for {getNetworkTierLabel(activeNetworkTier)}
            </Typography>
            {console.log('Network tier:', activeNetworkTier)}
            {console.log('selectedCoverageType:', selectedCoverageType)}
            {console.log('activeCoverageTab:', activeCoverageTab)}

            {/* Show coverage type buttons based on the selected coverage type */}
            {selectedCoverageType === CoverageType.Both ||
            selectedCoverageType === CoverageType.Family ? (
              // For Both or Family coverage type, show Adult and Pediatric options
              <ToggleButtonGroup
                value={activeCoverageTab}
                exclusive
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    setActiveCoverageTab(newValue);
                  }
                }}
                aria-label="Coverage type"
                color="secondary"
                sx={{
                  width: '100%',
                  '& .MuiToggleButtonGroup-grouped': {
                    flex: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value={0} aria-label="Adult coverage">
                  Adult
                </ToggleButton>
                <ToggleButton value={1} aria-label="Pediatric coverage">
                  Pediatric
                </ToggleButton>
              </ToggleButtonGroup>
            ) : (
              // For Adult or Pediatric coverage type, show a single disabled button
              <Button
                variant="outlined"
                color="secondary"
                disabled
                fullWidth
                sx={{ justifyContent: 'center', py: 1 }}
              >
                {getEnumDisplayName(selectedCoverageType)}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Cost Share Configuration - Tables for each coverage type and network tier */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cost Share Configuration for {getNetworkTierLabel(activeNetworkTier)} -{' '}
            {activeCoverageTab === 0
              ? selectedCoverageType === CoverageType.Pediatric
                ? 'Pediatric'
                : 'Adult'
              : 'Pediatric'}
          </Typography>

          {/* Table with striped rows for better readability */}
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell width="25%">
                    <strong>Benefit Class</strong>
                  </TableCell>
                  <TableCell width="25%">
                    <strong>Cost Share Type</strong>
                  </TableCell>
                  <TableCell width="25%">
                    <strong>Copay ($)</strong>
                  </TableCell>
                  <TableCell width="25%">
                    <strong>Coinsurance (%)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Debug data */}
                {console.log('Rendering table with class structure:', classStructure)}
                {console.log('Class structure classes in table:', classStructure?.classes)}
                {console.log(
                  'Class structure classes length in table:',
                  classStructure?.classes?.length
                )}
                {console.log('Class cost shares in table:', classCostShares)}

                {isLoadingClassStructure ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading benefit classes...</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : classStructureError ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Alert severity="error" sx={{ my: 2 }}>
                        Error loading benefit classes. Please try again.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : classStructure?.classes &&
                  Array.isArray(classStructure.classes) &&
                  classStructure.classes.length > 0 ? (
                  classStructure.classes.map((classItem: any, index: number) => {
                    // Determine which coverage type to display based on the active tab
                    const currentCoverageType =
                      activeCoverageTab === 0
                        ? selectedCoverageType === CoverageType.Pediatric
                          ? CoverageType.Pediatric
                          : CoverageType.Adult
                        : CoverageType.Pediatric;

                    // Find the cost share for this class, network tier, and coverage type
                    const costShare = classCostShares.find(
                      (share) =>
                        share.classId === classItem._id &&
                        share.networkTier === activeNetworkTier &&
                        share.coverageType === currentCoverageType
                    );

                    const costShareType = costShare?.costShareType || CostShareType.NotCovered;
                    const hasCopay = COST_SHARE_CONFIG[costShareType]?.hasCopay;
                    const hasCoinsurance = COST_SHARE_CONFIG[costShareType]?.hasCoinsurance;

                    return (
                      <TableRow
                        key={classItem._id}
                        sx={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                      >
                        <TableCell>
                          <Typography>
                            <strong>{classItem.name}</strong>
                          </Typography>
                          {classItem.description && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              {classItem.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <InputLabel id={`cost-share-type-label-${classItem._id}`}>
                              Type
                            </InputLabel>
                            <Select
                              labelId={`cost-share-type-label-${classItem._id}`}
                              value={costShareType}
                              label="Type"
                              onChange={(e) =>
                                handleCostShareTypeChange(
                                  classItem._id,
                                  e.target.value as CostShareType
                                )
                              }
                            >
                              {Object.values(CostShareType).map((type) => (
                                <MenuItem key={type} value={type}>
                                  {getEnumDisplayName(type)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            label="Copay"
                            disabled={!hasCopay}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            value={costShare?.values?.copayAmount || ''}
                            onChange={(e) => {
                              const newValue = e.target.value
                                ? parseFloat(e.target.value)
                                : undefined;
                              // Determine which coverage type is currently active
                              const currentCoverageType =
                                activeCoverageTab === 0
                                  ? selectedCoverageType === CoverageType.Pediatric
                                    ? CoverageType.Pediatric
                                    : CoverageType.Adult
                                  : CoverageType.Pediatric;

                              const updatedShares = classCostShares.map((share) =>
                                share.classId === classItem._id &&
                                share.networkTier === activeNetworkTier &&
                                share.coverageType === currentCoverageType
                                  ? { ...share, values: { ...share.values, copayAmount: newValue } }
                                  : share
                              );
                              setClassCostShares(updatedShares);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            label="Coinsurance"
                            disabled={!hasCoinsurance}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                            value={costShare?.values?.coinsurancePercentage || ''}
                            onChange={(e) => {
                              const newValue = e.target.value
                                ? parseFloat(e.target.value)
                                : undefined;
                              // Determine which coverage type is currently active
                              const currentCoverageType =
                                activeCoverageTab === 0
                                  ? selectedCoverageType === CoverageType.Pediatric
                                    ? CoverageType.Pediatric
                                    : CoverageType.Adult
                                  : CoverageType.Pediatric;

                              const updatedShares = classCostShares.map((share) =>
                                share.classId === classItem._id &&
                                share.networkTier === activeNetworkTier &&
                                share.coverageType === currentCoverageType
                                  ? {
                                      ...share,
                                      values: { ...share.values, coinsurancePercentage: newValue },
                                    }
                                  : share
                              );
                              setClassCostShares(updatedShares);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="textSecondary" sx={{ py: 2 }}>
                        No benefit classes found in the selected class structure.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Benefit Details Section - TODO */}
    </Box>
  );
};

export default PlanConfiguration;
