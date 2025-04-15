import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CardActions,
} from '@mui/material';
import { EditIcon } from '../../benefit-classes/common/icons';
import { CostShareType, COST_SHARE_CONFIG } from '../../../types/enums';
import { SaveOutlined, CancelOutlined } from '@mui/icons-material';
import { useActionBar } from '../../../context/ActionBarContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface CostShareValues {
  copayAmount?: number;
  coinsurancePercentage?: number;
}

interface ClassCostShare {
  classId: string;
  className: string;
  costShareType: CostShareType;
  values: CostShareValues;
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
  const [isSaving, setIsSaving] = useState(false);
  const [classCostShares, setClassCostShares] = useState<ClassCostShare[]>([]);

  // Get form data from router state
  const formData = location.state;

  useEffect(() => {
    if (!formData) {
      navigate('/plans');
      return;
    }

    // Initialize state from form data
    setPlanName(formData.name);
    setSavedPlanName(formData.name);
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
    innTiers: networkTiers,
    oonCoverage: hasOONCoverage,
    classStructure,
    limitStructure,
  } = formData;

  // Calculate number of network tiers
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
    setClassCostShares((prev) =>
      prev.map((share) =>
        share.classId === classId ? { ...share, costShareType: newType, values: {} } : share
      )
    );
  };

  return (
    <Box>
      {/* Header Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Plan Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                label="Plan Name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                disabled={!isEditing}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                label="Effective Date"
                value={effectiveDate}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                label="Market Segment"
                value={marketSegment}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                label="Product Type"
                value={productType}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                label="Class Structure"
                value={classStructure?.name || 'Not selected'}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                label="Limit Structure"
                value={limitStructure?.name || 'Not selected'}
                disabled
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          {!isEditing ? (
            <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <Box>
              <Button
                onClick={() => {
                  setSavedPlanName(planName);
                  setIsEditing(false);
                }}
                startIcon={<SaveOutlined />}
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setPlanName(savedPlanName);
                  setIsEditing(false);
                }}
                startIcon={<CancelOutlined />}
              >
                Cancel
              </Button>
            </Box>
          )}
        </CardActions>
      </Card>

      {/* Network Tier Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeNetworkTier}
          onChange={(_, newValue) => setActiveNetworkTier(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="standard"
          aria-label="network tiers"
        >
          {Array.from({ length: totalTiers }, (_, index) => (
            <Tab key={index} label={getNetworkTierLabel(index)} />
          ))}
        </Tabs>
      </Box>

      {/* Coverage Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeCoverageTab}
          onChange={(_, newValue) => setActiveCoverageTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="standard"
        >
          <Tab label="Adult" />
          <Tab label="Pediatric" />
          <Tab label="Family" />
        </Tabs>
      </Box>

      {/* Cost Share Grid */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cost Share Configuration
          </Typography>
          <Grid container spacing={2}>
            {classStructure?.classes?.map((classItem: any) => (
              <Grid item xs={12} key={classItem._id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4}>
                    <Typography>{classItem.name}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel>Cost Share Type</InputLabel>
                      <Select
                        value={
                          classCostShares.find((share) => share.classId === classItem._id)
                            ?.costShareType || ''
                        }
                        onChange={(e) =>
                          handleCostShareTypeChange(classItem._id, e.target.value as CostShareType)
                        }
                      >
                        {Object.values(CostShareType).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container spacing={2}>
                      {/* Copay field */}
                      {COST_SHARE_CONFIG[
                        classCostShares.find((share) => share.classId === classItem._id)
                          ?.costShareType || CostShareType.NotCovered
                      ]?.hasCopay && (
                        <Grid item xs={6}>
                          <TextField
                            label="Copay ($)"
                            type="number"
                            fullWidth
                            InputProps={{ startAdornment: '$' }}
                          />
                        </Grid>
                      )}
                      {/* Coinsurance field */}
                      {COST_SHARE_CONFIG[
                        classCostShares.find((share) => share.classId === classItem._id)
                          ?.costShareType || CostShareType.NotCovered
                      ]?.hasCoinsurance && (
                        <Grid item xs={6}>
                          <TextField
                            label="Coinsurance (%)"
                            type="number"
                            fullWidth
                            InputProps={{ endAdornment: '%' }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Benefit Details Section - TODO */}
    </Box>
  );
};

export default PlanConfiguration;
