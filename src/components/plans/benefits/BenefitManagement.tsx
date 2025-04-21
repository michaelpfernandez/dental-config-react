import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CostShareType,
  COST_SHARE_CONFIG,
  CoverageType,
  LimitIntervalType,
} from '../../../types/enums';
import { getEnumDisplayName } from '../../../utils/enumUtils';
import {
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

// Define interfaces for our data structures
interface CostShareValues {
  copayAmount?: number;
  coinsurancePercentage?: number;
}

interface BenefitCostShare {
  classId: string;
  benefitId: string;
  costShareType: CostShareType;
  values: CostShareValues;
  networkTier: number;
  coverageType: CoverageType;
}

interface BenefitLimit {
  classId: string;
  benefitId: string;
  quantity: number;
  interval: {
    type: LimitIntervalType;
    value: number;
  };
}

interface Benefit {
  id: string;
  name: string;
  description?: string;
  costShares: BenefitCostShare[];
  limits: BenefitLimit[];
}

interface BenefitClass {
  id: string;
  name: string;
  benefits: Benefit[];
}

interface ClassStructure {
  _id: string;
  name: string;
  classes?: Array<{
    _id: string;
    name: string;
    benefits: Array<{
      id: string;
      name: string;
      description?: string;
    }>;
  }>;
}

interface LimitStructure {
  _id: string;
  name: string;
  limits?: BenefitLimit[];
}

interface BenefitManagementProps {
  classStructure: ClassStructure;
  limitStructure: LimitStructure;
  costShares: BenefitCostShare[];
  activeNetworkTier: number;
  activeCoverageType: CoverageType;
  getNetworkTierLabel: (index: number) => string;
  onCostShareChange: (updatedCostShares: BenefitCostShare[]) => void;
  onLimitChange: (updatedLimits: BenefitLimit[]) => void;
}

// Props for the SortableItem component
interface SortableItemProps {
  id: string;
  benefit: Benefit;
  classId: string;
  getCostShare: (classId: string, benefitId: string) => BenefitCostShare | undefined;
  getLimit: (classId: string, benefitId: string) => BenefitLimit | undefined;
  editingLimitBenefitId: string | null;
  editingLimitClassId: string | null;
  limitValidationError: string | null;
  handleCostShareTypeChange: (classId: string, benefitId: string, newType: CostShareType) => void;
  handleCostShareValueChange: (
    classId: string,
    benefitId: string,
    field: keyof CostShareValues,
    value: number | undefined
  ) => void;
  handleLimitChange: (
    classId: string,
    benefitId: string,
    field: keyof BenefitLimit | 'intervalType',
    value: any
  ) => void;
  toggleLimitEditing: (classId: string, benefitId: string) => void;
}

// Sortable item component using dnd-kit
// Main BenefitManagement component
const BenefitManagement: React.FC<BenefitManagementProps> = ({
  classStructure,
  limitStructure,
  costShares,
  activeNetworkTier,
  activeCoverageType,
  getNetworkTierLabel,
  onCostShareChange,
  onLimitChange,
}) => {
  // State to manage the benefit classes
  const [benefitClasses, setBenefitClasses] = useState<BenefitClass[]>([]);
  const [editingLimitBenefitId, setEditingLimitBenefitId] = useState<string | null>(null);
  const [editingLimitClassId, setEditingLimitClassId] = useState<string | null>(null);
  const [limitValidationError, setLimitValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToClassId, setAddingToClassId] = useState<string | null>(null);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debug logging for limit structure
  useEffect(() => {
    console.log('Limit Structure received in BenefitManagement:', limitStructure);
    if (limitStructure && limitStructure.limits) {
      console.log('Limit Structure limits:', limitStructure.limits);
      console.log('Number of limits:', limitStructure.limits.length);

      // Log a few sample limits if they exist
      if (limitStructure.limits.length > 0) {
        console.log('Sample limit 0:', limitStructure.limits[0]);
      }
      if (limitStructure.limits.length > 1) {
        console.log('Sample limit 1:', limitStructure.limits[1]);
      }
    } else {
      console.log('No limits found in limit structure or limit structure is undefined');
    }
  }, [limitStructure]);

  // Initialize benefit classes from class structure
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    console.log('Initializing benefit classes with:', {
      classStructure,
      limitStructure,
      costShares,
    });

    try {
      if (
        classStructure &&
        Array.isArray(classStructure.classes) &&
        classStructure.classes.length > 0
      ) {
        const classes: BenefitClass[] = classStructure.classes.map((cls) => {
          console.log(`Processing class ${cls.name} with ID ${cls._id}`);
          return {
            id: cls._id,
            name: cls.name,
            benefits: cls.benefits.map((benefit) => {
              // Log benefit processing
              console.log(
                `Processing benefit ${benefit.name} with ID ${benefit.id} in class ${cls.name}`
              );

              // Find limits for this benefit
              const benefitLimits =
                limitStructure?.limits?.filter(
                  (limit) => limit.classId === cls._id && limit.benefitId === benefit.id
                ) || [];

              console.log(`Found ${benefitLimits.length} limits for benefit ${benefit.name}`);

              return {
                id: benefit.id,
                name: benefit.name,
                description: benefit.description,
                costShares: costShares.filter(
                  (cs) => cs.classId === cls._id && cs.benefitId === benefit.id
                ),
                limits: benefitLimits,
              };
            }),
          };
        });
        console.log('Final processed benefit classes:', classes);
        setBenefitClasses(classes);
      } else {
        console.log('No valid class structure found:', classStructure);
        setError('No benefit classes found in the class structure');
        setBenefitClasses([]);
      }
    } catch (err) {
      console.error('Error processing class structure:', err);
      setError('Error processing benefit classes');
      setBenefitClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [classStructure, limitStructure, costShares]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If no valid drop target or same position
    if (!over) return;

    // Extract IDs from the active and over items
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Parse the IDs to get class ID and benefit ID
    // Format: "classId-benefitId"
    const [sourceClassId, sourceBenefitId] = activeId.split('-');
    const [destinationClassId, destinationBenefitId] = overId.split('-');

    // Find the classes in our state
    const sourceClassIndex = benefitClasses.findIndex((cls) => cls.id === sourceClassId);
    const destinationClassIndex = benefitClasses.findIndex((cls) => cls.id === destinationClassId);

    if (sourceClassIndex === -1 || destinationClassIndex === -1) {
      console.error('Could not find source or destination class');
      return;
    }

    // Create a new array of classes to avoid mutating state
    const newBenefitClasses = [...benefitClasses];

    // Get the source and destination benefits
    const sourceBenefits = [...newBenefitClasses[sourceClassIndex].benefits];
    const sourceItemIndex = sourceBenefits.findIndex((benefit) => benefit.id === sourceBenefitId);

    // If moving within the same class
    if (sourceClassId === destinationClassId) {
      const destinationItemIndex = sourceBenefits.findIndex(
        (benefit) => benefit.id === destinationBenefitId
      );

      // Reorder the benefits in the class using arrayMove utility
      newBenefitClasses[sourceClassIndex].benefits = arrayMove(
        sourceBenefits,
        sourceItemIndex,
        destinationItemIndex
      );
    } else {
      // Moving between classes
      const destinationBenefits = [...newBenefitClasses[destinationClassIndex].benefits];
      const destinationItemIndex = destinationBenefits.findIndex(
        (benefit) => benefit.id === destinationBenefitId
      );

      // Get the benefit being moved
      const movedBenefit = sourceBenefits[sourceItemIndex];

      // Remove from source class
      sourceBenefits.splice(sourceItemIndex, 1);
      newBenefitClasses[sourceClassIndex].benefits = sourceBenefits;

      // Add to destination class
      destinationBenefits.splice(
        destinationItemIndex >= 0 ? destinationItemIndex : destinationBenefits.length,
        0,
        movedBenefit
      );
      newBenefitClasses[destinationClassIndex].benefits = destinationBenefits;

      // Update cost shares for the moved benefit to reflect the new class
      const updatedCostShares = costShares.map((cs) => {
        if (cs.benefitId === movedBenefit.id && cs.classId === sourceClassId) {
          return {
            ...cs,
            classId: destinationClassId,
          };
        }
        return cs;
      });

      // Update limits for the moved benefit to reflect the new class
      const updatedLimits =
        limitStructure?.limits?.map((limit) => {
          if (limit.benefitId === movedBenefit.id && limit.classId === sourceClassId) {
            return {
              ...limit,
              classId: destinationClassId,
            };
          }
          return limit;
        }) || [];

      // Call the callbacks to update parent state
      onCostShareChange(updatedCostShares);
      onLimitChange(updatedLimits);
    }

    // Update our local state
    setBenefitClasses(newBenefitClasses);
  };

  // Handle cost share type change
  const handleCostShareTypeChange = (
    classId: string,
    benefitId: string,
    newType: CostShareType
  ) => {
    const updatedCostShares = costShares.map((cs) => {
      if (
        cs.classId === classId &&
        cs.benefitId === benefitId &&
        cs.networkTier === activeNetworkTier &&
        cs.coverageType === activeCoverageType
      ) {
        return {
          ...cs,
          costShareType: newType,
          values: {}, // Reset values when changing type
        };
      }
      return cs;
    });

    onCostShareChange(updatedCostShares);
  };

  // Handle cost share value change
  const handleCostShareValueChange = (
    classId: string,
    benefitId: string,
    field: keyof CostShareValues,
    value: number | undefined
  ) => {
    const updatedCostShares = costShares.map((cs) => {
      if (
        cs.classId === classId &&
        cs.benefitId === benefitId &&
        cs.networkTier === activeNetworkTier &&
        cs.coverageType === activeCoverageType
      ) {
        return {
          ...cs,
          values: {
            ...cs.values,
            [field]: value,
          },
        };
      }
      return cs;
    });

    onCostShareChange(updatedCostShares);
  };

  // Handle limit change
  const handleLimitChange = (
    classId: string,
    benefitId: string,
    field: keyof BenefitLimit | 'intervalType',
    value: any
  ) => {
    // Validate quantity if that's what's being changed
    if (field === 'quantity') {
      if (isNaN(value) || value <= 0) {
        setLimitValidationError('Quantity must be a positive number');
        return;
      } else {
        setLimitValidationError(null);
      }
    }

    // Get the current limits
    const currentLimits = limitStructure?.limits || [];

    // Find the index of the limit we're updating
    const limitIndex = currentLimits.findIndex(
      (limit) => limit.classId === classId && limit.benefitId === benefitId
    );

    // Create a copy of the limits array
    const updatedLimits = [...currentLimits];

    // If the limit exists, update it
    if (limitIndex !== -1) {
      const updatedLimit = { ...updatedLimits[limitIndex] };

      // Handle interval type change
      if (field === 'intervalType') {
        updatedLimit.interval = {
          ...updatedLimit.interval,
          type: value,
        };
      } else {
        // Handle other fields
        (updatedLimit as any)[field] = value;
      }

      updatedLimits[limitIndex] = updatedLimit;
    } else {
      // If the limit doesn't exist, create a new one
      const newLimit: BenefitLimit = {
        classId,
        benefitId,
        quantity: field === 'quantity' ? value : 1,
        interval: {
          type: field === 'intervalType' ? value : LimitIntervalType.PerYear,
          value: 1,
        },
      };

      updatedLimits.push(newLimit);
    }

    // Update the limits
    onLimitChange(updatedLimits);
  };

  // Get cost share for a specific benefit
  const getCostShare = (classId: string, benefitId: string) => {
    // First, try to find a benefit-specific cost share
    const benefitCostShare = costShares.find(
      (cs) =>
        cs.classId === classId &&
        cs.benefitId === benefitId &&
        cs.networkTier === activeNetworkTier &&
        cs.coverageType === activeCoverageType
    );

    // If we found a benefit-specific cost share, return it
    if (benefitCostShare) {
      return benefitCostShare;
    }

    // Otherwise, look for a class-level cost share to inherit from
    // This is identified by having a classId but no benefitId
    const classCostShare = costShares.find(
      (cs) =>
        cs.classId === classId &&
        !cs.benefitId && // Class-level cost shares don't have a benefitId
        cs.networkTier === activeNetworkTier &&
        cs.coverageType === activeCoverageType
    );

    // If we found a class-level cost share, create a new cost share object for this benefit
    // that inherits the values from the class-level cost share
    if (classCostShare) {
      return {
        classId,
        benefitId,
        costShareType: classCostShare.costShareType,
        values: { ...classCostShare.values },
        networkTier: activeNetworkTier,
        coverageType: activeCoverageType,
      };
    }

    // If we couldn't find either, return undefined
    return undefined;
  };

  // This function has been moved to the SortableItem component

  // Get limit for a specific benefit - match only on benefit ID
  const getLimit = (classId: string, benefitId: string) => {
    // First, check if we have a limit structure
    if (!limitStructure || !limitStructure.limits) {
      console.log('No limit structure or limits available');
      return undefined;
    }

    console.log(`Looking for limit with benefitId=${benefitId}`);

    // Look for a benefit-specific limit using only the benefit ID
    // This allows benefits to be moved between classes while keeping their limits
    const benefitLimit = limitStructure.limits.find((limit) => limit.benefitId === benefitId);

    if (benefitLimit) {
      console.log(`Found limit for benefit ${benefitId}:`, benefitLimit);
      return benefitLimit;
    }

    // If no benefit-specific limit is found, we don't try to use class-level limits
    // since the class association can change with drag and drop
    console.log(`No limit found for benefit ${benefitId}`);
    return undefined;
  };

  // Toggle limit editing
  const toggleLimitEditing = (classId: string, benefitId: string) => {
    if (editingLimitBenefitId === benefitId && editingLimitClassId === classId) {
      setEditingLimitBenefitId(null);
      setEditingLimitClassId(null);
    } else {
      setEditingLimitBenefitId(benefitId);
      setEditingLimitClassId(classId);
    }
    setLimitValidationError(null);
  };

  // Toggle adding benefits to a class
  const toggleAddingToClass = (classId: string) => {
    if (addingToClassId === classId) {
      setAddingToClassId(null);
    } else {
      setAddingToClassId(classId);
    }
  };

  // Get all available benefits that are not in a specific class
  const getAvailableBenefitsForClass = (classId: string) => {
    // Get all unique benefits across all classes
    const allBenefits = getAllUniqueBenefits();

    // Get benefits in the current class
    const classIndex = benefitClasses.findIndex((cls) => cls.id === classId);
    if (classIndex === -1) return [];

    const benefitsInClass = benefitClasses[classIndex].benefits;
    const benefitIdsInClass = benefitsInClass.map((b) => b.id);

    // Return benefits that are not in the current class
    return allBenefits.filter((benefit) => !benefitIdsInClass.includes(benefit.id));
  };

  // Add a benefit to a class
  const addBenefitToClass = (classId: string, benefitId: string, benefitName: string) => {
    // Find the class
    const classIndex = benefitClasses.findIndex((cls) => cls.id === classId);
    if (classIndex === -1) return;

    // Create a copy of the benefit classes
    const newBenefitClasses = [...benefitClasses];

    // Add the benefit to the class
    const newBenefit: Benefit = {
      id: benefitId,
      name: benefitName,
      costShares: [],
      limits: [],
    };

    newBenefitClasses[classIndex].benefits.push(newBenefit);

    // Create cost shares for the new benefit for all network tiers and coverage types
    const newCostShares = [...costShares];

    // Find the existing cost share for this class in the current network tier and coverage type
    // This is the cost share from the cost share configuration table
    const existingClassCostShare = costShares.find(
      (cs) =>
        cs.classId === classId &&
        cs.networkTier === activeNetworkTier &&
        cs.coverageType === activeCoverageType
    );

    // Add cost share for the current network tier and coverage type
    // Inherit values from the class cost share configuration if available
    newCostShares.push({
      classId,
      benefitId,
      // Use the cost share type from the class configuration, or default to Coinsurance
      costShareType: existingClassCostShare?.costShareType || CostShareType.Coinsurance,
      // Use the values from the class configuration, or default values
      values: existingClassCostShare?.values || { coinsurancePercentage: 20 },
      networkTier: activeNetworkTier,
      coverageType: activeCoverageType,
    });

    // Update state
    setBenefitClasses(newBenefitClasses);
    onCostShareChange(newCostShares);

    // Close the add benefit panel
    setAddingToClassId(null);
  };

  // Get all unique benefits across all classes
  const getAllUniqueBenefits = () => {
    const uniqueBenefits = new Map<string, { id: string; name: string }>();

    benefitClasses.forEach((cls) => {
      cls.benefits.forEach((benefit) => {
        uniqueBenefits.set(benefit.id, { id: benefit.id, name: benefit.name });
      });
    });

    return Array.from(uniqueBenefits.values());
  };

  return (
    <Box sx={{ width: '100%' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {benefitClasses.map((benefitClass) => (
              <Paper key={benefitClass.id} sx={{ mb: 3, overflow: 'hidden' }}>
                {/* Class Header */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6">
                    {benefitClass.name} ({benefitClass.benefits.length} Benefits)
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => toggleAddingToClass(benefitClass.id)}
                  >
                    Add Benefit
                  </Button>
                </Box>

                {/* Add Benefit Panel */}
                {addingToClassId === benefitClass.id && (
                  <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Add benefit to {benefitClass.name}:
                    </Typography>
                    <Grid container spacing={1}>
                      {getAvailableBenefitsForClass(benefitClass.id).length > 0 ? (
                        getAvailableBenefitsForClass(benefitClass.id).map((benefit) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={benefit.id}>
                            <Button
                              variant="outlined"
                              size="small"
                              fullWidth
                              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                              onClick={() =>
                                addBenefitToClass(benefitClass.id, benefit.id, benefit.name)
                              }
                            >
                              {benefit.name}
                            </Button>
                          </Grid>
                        ))
                      ) : (
                        <Grid item xs={12}>
                          <Typography color="text.secondary">
                            No available benefits to add
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}

                {/* Benefits Table - Using a non-table structure for drag and drop compatibility */}
                <Paper sx={{ mb: 2 }}>
                  {/* Table Header - Static */}
                  <Box
                    sx={{
                      display: 'flex',
                      bgcolor: 'background.paper',
                      borderBottom: 1,
                      borderColor: 'divider',
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ width: '30px' }}></Box>
                    <Box sx={{ width: '200px', fontWeight: 'bold' }}>Benefit</Box>
                    <Box sx={{ width: '150px', fontWeight: 'bold' }}>Cost Share Type</Box>
                    <Box sx={{ width: '120px', fontWeight: 'bold' }}>Copay</Box>
                    <Box sx={{ width: '120px', fontWeight: 'bold' }}>Coinsurance</Box>
                    <Box sx={{ flexGrow: 1, fontWeight: 'bold' }}>Limit</Box>
                  </Box>

                  {/* Droppable Area */}
                  <SortableContext
                    items={benefitClass.benefits.map((b) => `${benefitClass.id}-${b.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Box sx={{ p: 1 }}>
                      {benefitClass.benefits.map((benefit) => (
                        <SortableItem
                          key={benefit.id}
                          id={`${benefitClass.id}-${benefit.id}`}
                          benefit={benefit}
                          classId={benefitClass.id}
                          getCostShare={getCostShare}
                          getLimit={getLimit}
                          editingLimitBenefitId={editingLimitBenefitId}
                          editingLimitClassId={editingLimitClassId}
                          limitValidationError={limitValidationError}
                          handleCostShareTypeChange={handleCostShareTypeChange}
                          handleCostShareValueChange={handleCostShareValueChange}
                          handleLimitChange={handleLimitChange}
                          toggleLimitEditing={toggleLimitEditing}
                        />
                      ))}
                      {benefitClass.benefits.length === 0 && (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            No benefits in this class. Add benefits using the button above.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </SortableContext>
                </Paper>
              </Paper>
            ))}
          </Box>
        </DndContext>
      )}
    </Box>
  );
};

export default BenefitManagement;

// Sortable item component
const SortableItem = ({
  id,
  benefit,
  classId,
  getCostShare,
  getLimit,
  editingLimitBenefitId,
  editingLimitClassId,
  limitValidationError,
  handleCostShareTypeChange,
  handleCostShareValueChange,
  handleLimitChange,
  toggleLimitEditing,
}: SortableItemProps) => {
  // We now use getEnumDisplayName for limit interval types

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const costShare = getCostShare(classId, benefit.id);
  const limit = getLimit(classId, benefit.id);
  const isEditingLimit = editingLimitBenefitId === benefit.id && editingLimitClassId === classId;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        mb: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {/* Drag Handle */}
      <Box sx={{ width: '30px' }} {...attributes} {...listeners}>
        <DragIcon fontSize="small" color="action" />
      </Box>

      {/* Benefit Name */}
      <Box sx={{ width: '200px' }}>
        <Typography variant="body2" fontWeight="medium">
          {benefit.name}
        </Typography>
      </Box>

      {/* Cost Share Type - Read Only */}
      <Box sx={{ width: '180px', display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">
          {costShare?.costShareType ? getEnumDisplayName(costShare.costShareType) : 'Not Covered'}
        </Typography>
      </Box>

      {/* Copay - Read Only */}
      <Box
        sx={{ width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
      >
        {costShare?.costShareType === CostShareType.Copay ||
        costShare?.costShareType === CostShareType.CopayThenCoinsurance ||
        costShare?.costShareType === CostShareType.DeductibleThenCopay ? (
          <Typography variant="body2">${costShare?.values?.copayAmount || '0'}</Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </Box>

      {/* Coinsurance - Read Only */}
      <Box
        sx={{ width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
      >
        {costShare?.costShareType === CostShareType.Coinsurance ||
        costShare?.costShareType === CostShareType.CopayThenCoinsurance ||
        costShare?.costShareType === CostShareType.DeductibleThenCoinsurance ? (
          <Typography variant="body2">
            {costShare?.values?.coinsurancePercentage || '0'}%
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </Box>

      {/* Limit - Read Only */}
      <Box
        sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Typography variant="body2">
          {limit
            ? `${limit.quantity} ${limit.unit === 'n/a' || limit.unit === 'N/A' ? '' : getEnumDisplayName(limit.unit)} ${getEnumDisplayName(limit.interval.type)}`
                .trim()
                .replace(/\s+/g, ' ')
            : 'No limit set'}
        </Typography>
      </Box>
    </Box>
  );
};
