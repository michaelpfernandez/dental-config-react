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
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import EditableCard from '../../common/EditableCard';
import { CostShareType, COST_SHARE_CONFIG } from '../../../types/enums';
import { SaveOutlined, CancelOutlined, Edit as EditIcon } from '@mui/icons-material';
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
                value={hasOONCoverage ? 'In and Out-of-Network' : 'In-Network Only'}
                disabled={true}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          {isEditing ? (
            <Box sx={{ ml: 'auto' }}>
              <Button
                onClick={() => {
                  setPlanName(savedPlanName);
                  setIsEditing(false);
                }}
                variant="outlined"
                color="primary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSavedPlanName(planName);
                  setIsEditing(false);
                }}
                variant="contained"
                color="primary"
                sx={{ ml: 1 }}
              >
                Done
              </Button>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => setIsEditing(true)} startIcon={<EditIcon />}>
              Edit
            </Button>
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
