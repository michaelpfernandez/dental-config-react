import React, { useState, useEffect, useMemo } from 'react';
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
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  defaultDropAnimation,
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
  ArrowForward as ArrowForwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
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
  onClassStructureChange: (updatedClassStructure: ClassStructure) => void;
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
    field: 'copay' | 'coinsurance',
    value: number | null
  ) => void;
  handleLimitChange: (
    classId: string,
    benefitId: string,
    field: keyof BenefitLimit | 'intervalType',
    value: any
  ) => void;
  toggleLimitEditing: (classId: string, benefitId: string) => void;
  selectBenefitForMove: (benefit: Benefit, classId: string) => void;
  moveBenefitToClass: (benefitId: string, fromClassId: string, toClassId: string) => void;
  benefitClasses: BenefitClass[];
  selectedBenefitForMove: {
    benefitId: string;
    fromClassId: string;
    benefitName: string;
  } | null;
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
  onClassStructureChange,
}) => {
  // DEBUG LOGGING
  console.log('BenefitManagement: classStructure prop:', classStructure);
  console.log('BenefitManagement: classStructure.classes:', classStructure?.classes);
  if (classStructure?.classes) {
    classStructure.classes.forEach((cls, idx) => {
      console.log(`BenefitManagement: Class ${idx}:`, cls);
      console.log(`BenefitManagement: Class ${idx} benefits:`, cls.benefits);
    });
  }

  // Always derive benefitClasses from classStructure prop
  const benefitClasses = useMemo(() => {
    // Defensive: handle null/undefined
    if (!classStructure || !classStructure.classes) return [];
    return classStructure.classes.map((cls) => ({
      id: cls._id,
      name: cls.name,
      benefits: cls.benefits || [],
    }));
  }, [classStructure, costShares, limitStructure]);

  // DEBUG LOGGING
  console.log('BenefitManagement: benefitClasses (derived):', benefitClasses);
  benefitClasses.forEach((bc, idx) => {
    console.log(`BenefitManagement: benefitClasses[${idx}]:`, bc);
    console.log(`BenefitManagement: benefitClasses[${idx}].benefits:`, bc.benefits);
  });

  const [editingLimitBenefitId, setEditingLimitBenefitId] = useState<string | null>(null);
  const [editingLimitClassId, setEditingLimitClassId] = useState<string | null>(null);
  const [limitValidationError, setLimitValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToClassId, setAddingToClassId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Simple state for direct benefit movement
  const [selectedBenefitForMove, setSelectedBenefitForMove] = useState<{
    benefitId: string;
    fromClassId: string;
    benefitName: string;
  } | null>(null);

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

  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  // Initialize limit structure
  useEffect(() => {
    if (limitStructure && limitStructure.limits) {
      // Process limits if needed
    }
  }, [limitStructure]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    // If no valid drop target or same position
    if (!over) {
      console.warn('DragEnd: No valid drop target.');
      return;
    }

    // Extract IDs from the active and over items
    const activeId = active.id as string;
    const overId = over.id as string;
    console.log('DragEnd event:', { activeId, overId });

    if (activeId === overId) {
      console.log('DragEnd: activeId and overId are the same, no move needed.');
      return;
    }

    // Parse the IDs to get class ID and benefit ID
    // Format: "classId-benefitId"
    const [sourceClassId, sourceBenefitId] = activeId.split('-');
    const [destinationClassId, destinationBenefitId] = overId.split('-');
    console.log('Parsed IDs:', {
      sourceClassId,
      sourceBenefitId,
      destinationClassId,
      destinationBenefitId,
    });

    // If we're dragging between classes
    if (sourceClassId !== destinationClassId) {
      console.log(
        `Moving benefit '${sourceBenefitId}' from class '${sourceClassId}' to class '${destinationClassId}'`
      );
      // Build new classStructure with benefit moved
      if (!classStructure || !Array.isArray(classStructure.classes)) return;
      const updatedClasses = classStructure.classes.map((cls) => {
        if (cls._id === sourceClassId) {
          return {
            ...cls,
            benefits: cls.benefits.filter((b) => b.id !== sourceBenefitId),
          };
        }
        if (cls._id === destinationClassId) {
          // Find the benefit to move
          const sourceClass = classStructure.classes.find((c) => c._id === sourceClassId);
          const benefitToMove = sourceClass?.benefits.find((b) => b.id === sourceBenefitId);
          if (benefitToMove) {
            return {
              ...cls,
              benefits: [...cls.benefits, benefitToMove],
            };
          }
        }
        return cls;
      });
      const updatedClassStructure = {
        ...classStructure,
        classes: updatedClasses,
      };
      onClassStructureChange(updatedClassStructure);
      return;
    }

    // If we're just reordering within the same class
    // Find the class in our state
    if (!classStructure || !Array.isArray(classStructure.classes)) return;
    const sourceClassIndex = classStructure.classes.findIndex(
      (cls) => String(cls._id) === String(sourceClassId)
    );
    if (sourceClassIndex === -1) return;
    const sourceClass = classStructure.classes[sourceClassIndex];
    const sourceBenefits = [...sourceClass.benefits];
    const sourceItemIndex = sourceBenefits.findIndex(
      (benefit) => String(benefit.id) === String(sourceBenefitId)
    );
    const destinationItemIndex = sourceBenefits.findIndex(
      (benefit) => String(benefit.id) === String(destinationBenefitId)
    );
    if (sourceItemIndex === -1 || destinationItemIndex === -1) return;
    // Reorder the benefits in the class using arrayMove utility
    const newBenefits = arrayMove(sourceBenefits, sourceItemIndex, destinationItemIndex);
    const updatedClasses = classStructure.classes.map((cls, idx) =>
      idx === sourceClassIndex ? { ...cls, benefits: newBenefits } : cls
    );
    const updatedClassStructure = {
      ...classStructure,
      classes: updatedClasses,
    };
    onClassStructureChange(updatedClassStructure);
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

  // Get limit for a specific benefit - match only on benefit ID
  const getLimit = (classId: string, benefitId: string) => {
    // First, check if we have a limit structure
    if (!limitStructure || !limitStructure.limits) {
      return undefined;
    }

    // Look for a benefit-specific limit using only the benefit ID
    // This allows benefits to be moved between classes while keeping their limits
    const benefitLimit = limitStructure.limits.find((limit) => limit.benefitId === benefitId);

    if (benefitLimit) {
      return benefitLimit;
    }

    // If no benefit-specific limit is found, we don't try to use class-level limits
    // since the class association can change with drag and drop
    return undefined;
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

  const moveBenefitToClass = (benefitId: string, fromClassId: string, toClassId: string) => {
    // Find the source and destination classes
    const sourceClass = benefitClasses.find((c) => String(c.id) === String(fromClassId));
    const destClass = benefitClasses.find((c) => String(c.id) === String(toClassId));

    // Find the benefit to move
    const benefitToMove = sourceClass?.benefits.find((b) => String(b.id) === String(benefitId));

    if (!sourceClass || !destClass || !benefitToMove) {
      console.error('Missing data for move operation');
      return;
    }

    // Create updated classes with the benefit moved
    const updatedClasses = benefitClasses.map((cls) => {
      // Remove from source class
      if (String(cls.id) === String(fromClassId)) {
        return {
          ...cls,
          benefits: cls.benefits.filter((b) => String(b.id) !== String(benefitId)),
        };
      }

      // Add to destination class
      if (String(cls.id) === String(toClassId)) {
        return {
          ...cls,
          benefits: [...cls.benefits, benefitToMove],
        };
      }

      return cls;
    });

    // Find class-level cost share for destination class
    const destinationClassCostShare = costShares.find(
      (cs) =>
        String(cs.classId) === String(toClassId) &&
        !cs.benefitId &&
        cs.networkTier === activeNetworkTier &&
        cs.coverageType === activeCoverageType
    );

    // Update cost shares
    const updatedCostShares = costShares.map((cs) => {
      if (
        String(cs.benefitId) === String(benefitId) &&
        String(cs.classId) === String(fromClassId) &&
        cs.networkTier === activeNetworkTier &&
        cs.coverageType === activeCoverageType
      ) {
        if (destinationClassCostShare) {
          return {
            ...cs,
            classId: toClassId,
            costShareType: destinationClassCostShare.costShareType,
            values: { ...destinationClassCostShare.values },
          };
        } else {
          return {
            ...cs,
            classId: toClassId,
          };
        }
      }
      return cs;
    });

    // Update limits
    const updatedLimits =
      limitStructure?.limits?.map((limit) => {
        if (
          String(limit.benefitId) === String(benefitId) &&
          String(limit.classId) === String(fromClassId)
        ) {
          return {
            ...limit,
            classId: toClassId,
          };
        }
        return limit;
      }) || [];

    // Update state
    onCostShareChange(updatedCostShares);
    onLimitChange(updatedLimits);

    // Clear selected benefit
    setSelectedBenefitForMove(null);
  };

  // Toggle adding benefits to a class
  const toggleAddingToClass = (classId: string) => {
    if (addingToClassId === classId) {
      setAddingToClassId(null);
    } else {
      setAddingToClassId(classId);
    }
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

  // Select a benefit for moving
  const selectBenefitForMove = (benefit: Benefit, classId: string) => {
    setSelectedBenefitForMove({
      benefitId: benefit.id,
      fromClassId: classId,
      benefitName: benefit.name,
    });
  };

  // Cancel benefit selection
  const clearSelectedBenefit = () => {
    setSelectedBenefitForMove(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Benefit movement banner */}
      {selectedBenefitForMove && (
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            p: 2,
            mb: 2,
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
              Moving: {selectedBenefitForMove.benefitName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a destination class below
            </Typography>
          </Box>
          <Button variant="outlined" color="inherit" size="small" onClick={clearSelectedBenefit}>
            Cancel
          </Button>
        </Paper>
      )}

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Create a single array of all items for the SortableContext */}
          <SortableContext
            items={benefitClasses.flatMap((cls) =>
              cls.benefits.map((b) => `${String(cls.id)}-${String(b.id)}`)
            )}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {benefitClasses.map((benefitClass) => (
                <Paper key={benefitClass.id} sx={{ mb: 3, overflow: 'hidden' }}>
                  {/* Class Header */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: selectedBenefitForMove ? 'primary.light' : 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor:
                        selectedBenefitForMove &&
                        selectedBenefitForMove.fromClassId !== benefitClass.id
                          ? 'pointer'
                          : 'default',
                      '&:hover':
                        selectedBenefitForMove &&
                        selectedBenefitForMove.fromClassId !== benefitClass.id
                          ? { bgcolor: 'primary.dark' }
                          : {},
                    }}
                    onClick={() => {
                      if (
                        selectedBenefitForMove &&
                        selectedBenefitForMove.fromClassId !== benefitClass.id
                      ) {
                        moveBenefitToClass(
                          selectedBenefitForMove.benefitId,
                          selectedBenefitForMove.fromClassId,
                          benefitClass.id
                        );
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ mr: 2 }}>
                        {benefitClass.name} ({benefitClass.benefits.length} Benefits)
                      </Typography>
                      {selectedBenefitForMove &&
                        selectedBenefitForMove.fromClassId !== benefitClass.id && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'primary.contrastText',
                              bgcolor: 'primary.dark',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            Click to move here
                          </Typography>
                        )}
                    </Box>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAddingToClass(benefitClass.id);
                      }}
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
                  <Box sx={{ mb: 2 }}>
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

                    {/* Benefit Items */}
                    <Box sx={{ p: 1 }}>
                      {benefitClass.benefits.map((benefit) => (
                        <SortableItem
                          key={benefit.id}
                          id={`${String(benefitClass.id)}-${String(benefit.id)}`}
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
                          selectBenefitForMove={selectBenefitForMove}
                          moveBenefitToClass={moveBenefitToClass}
                          benefitClasses={benefitClasses}
                          selectedBenefitForMove={selectedBenefitForMove}
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
                  </Box>
                </Paper>
              ))}
            </Box>
          </SortableContext>
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
  selectBenefitForMove,
  moveBenefitToClass,
  benefitClasses,
  selectedBenefitForMove,
}: SortableItemProps) => {
  // We now use getEnumDisplayName for limit interval types

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: 'benefit',
      benefit,
      classId,
    },
  });

  const costShare = getCostShare(classId, benefit.id);
  const limit = getLimit(classId, benefit.id);
  const isEditingLimit = editingLimitBenefitId === benefit.id && editingLimitClassId === classId;
  const isMoving =
    selectedBenefitForMove?.benefitId === benefit.id &&
    selectedBenefitForMove?.fromClassId === classId;

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
        bgcolor: isMoving ? 'primary.light' : 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        position: 'relative',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {/* Drag Handle */}
      <Box sx={{ width: '30px', display: 'flex', alignItems: 'center' }}>
        <Box {...attributes} {...listeners} sx={{ display: 'flex', cursor: 'grab' }}>
          <DragIcon fontSize="small" color="action" />
        </Box>
      </Box>

      {/* Move Button */}
      <Box sx={{ width: '30px', mr: 1 }}>
        <IconButton
          size="small"
          onClick={() => selectBenefitForMove(benefit, classId)}
          aria-label="move benefit"
          color={selectedBenefitForMove?.benefitId === benefit.id ? 'primary' : 'default'}
        >
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Benefit Name */}
      <Box sx={{ width: '200px' }}>
        <Typography variant="body2" fontWeight="medium">
          {benefit.name || ''}
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
