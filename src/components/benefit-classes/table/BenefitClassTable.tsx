import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from '@mui/material';
import { EditIcon } from '../common/icons';
import { fetchBenefitClasses, fetchBenefitsList } from '../../../services/api';
import BenefitAssignmentDialog from '../dialogs/BenefitAssignmentDialog';
import { clientLogger } from '../../../utils/clientLogger';

export interface BenefitClass {
  id: string;
  name: string;
}

export interface Benefit {
  id: string;
  name: string;
}

export interface BenefitClassTableProps {
  numberOfClasses: number;
  onClassDataChange?: (
    classData: Array<{ id: string; name: string; benefits: Array<{ id: string; name: string }> }>
  ) => void;
}

const BenefitClassTable: React.FC<BenefitClassTableProps> = ({
  numberOfClasses,
  onClassDataChange,
}) => {
  const [availableClasses, setAvailableClasses] = useState<BenefitClass[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [classBenefits, setClassBenefits] = useState<Map<number, string[]>>(new Map());
  const [selectedClasses, setSelectedClasses] = useState<Map<number, string>>(new Map());

  const handleEdit = (classId: string, rowIndex: number) => {
    setSelectedRow(rowIndex);
    const currentBenefits = classBenefits.get(rowIndex) || [];
    setSelectedBenefits(currentBenefits);
    setOpen(true);
  };

  const handleBenefitSelect = (benefitIds: string[]) => {
    setSelectedBenefits(benefitIds);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBenefits([]);
    setSelectedRow(null);
  };

  // Helper function to get the current class data
  const getClassData = () => {
    console.log('[BenefitClassTable] Getting class data...');
    console.log('[BenefitClassTable] Current selected classes:', selectedClasses);
    console.log('[BenefitClassTable] Current class benefits:', classBenefits);

    const classData = Array.from({ length: numberOfClasses }).map((_, i) => {
      const classIndex = i + 1;
      const selectedClassId = selectedClasses.get(i);
      const benefitIds = classBenefits.get(i) || [];

      // Find the selected class in available classes if one is selected
      const selectedClass = selectedClassId
        ? availableClasses.find((c) => String(c.id) === String(selectedClassId))
        : null;

      // Map the benefits for this class
      const benefitsForClass = benefitIds
        .map((benefitId) => {
          const benefit = benefits.find((b) => String(b.id) === String(benefitId));
          return benefit
            ? {
                id: String(benefit.id),
                name: benefit.name,
              }
            : null;
        })
        .filter((b): b is { id: string; name: string } => b !== null);

      return {
        // Always use sequential IDs
        id: String(classIndex),
        // Use selected class name if available, otherwise default
        name: selectedClass?.name || `Class ${classIndex}`,
        benefits: benefitsForClass,
      };
    });

    console.log('[BenefitClassTable] Generated class data:', classData);
    return classData;
  };

  const handleSave = () => {
    if (selectedRow !== null) {
      // Create new Map with current state plus new benefits
      const newMap = new Map(classBenefits);
      newMap.set(selectedRow, [...selectedBenefits]);

      clientLogger.info('Saving benefits for row:', {
        row: selectedRow,
        benefits: selectedBenefits,
      });

      // Generate class data using the updated benefits map directly
      // This ensures the latest benefits are included without waiting for state update
      const classData = Array.from({ length: numberOfClasses }).map((_, i) => {
        const classIndex = i + 1;
        const selectedClassId = selectedClasses.get(i);
        // Use the updated map for benefits
        const benefitIds = i === selectedRow ? selectedBenefits : newMap.get(i) || [];

        // Find the selected class in available classes if one is selected
        const selectedClass = selectedClassId
          ? availableClasses.find((c) => String(c.id) === String(selectedClassId))
          : null;

        // Map the benefits for this class
        const benefitsForClass = benefitIds
          .map((benefitId) => {
            const benefit = benefits.find((b) => String(b.id) === String(benefitId));
            return benefit
              ? {
                  id: String(benefit.id),
                  name: benefit.name,
                }
              : null;
          })
          .filter((b): b is { id: string; name: string } => b !== null);

        return {
          id: String(classIndex),
          name: selectedClass?.name || `Class ${classIndex}`,
          benefits: benefitsForClass,
        };
      });

      // Update state
      setClassBenefits(newMap);

      // Notify parent component with the directly calculated class data
      if (onClassDataChange) {
        clientLogger.info('Notifying parent with updated class data:', classData);
        onClassDataChange(classData);
      }
    }
    handleClose();
  };

  const formatBenefits = (benefitIds: string[]): string => {
    if (!benefitIds || benefitIds.length === 0) return '';
    return benefits
      .filter((benefit) => benefitIds.includes(benefit.id.toString()))
      .map((benefit) => benefit.name)
      .join(', ');
  };

  useEffect(() => {
    const loadBenefits = async () => {
      try {
        const fetchedBenefits = await fetchBenefitsList();
        clientLogger.info('Fetched benefits:', fetchedBenefits);
        setBenefits(fetchedBenefits.benefits);
      } catch (error) {
        clientLogger.error('Error fetching benefits:', error);
      }
    };

    loadBenefits();
  }, []);

  useEffect(() => {
    const loadBenefitClasses = async () => {
      try {
        const fetchedClasses = await fetchBenefitClasses();
        clientLogger.info('Fetched benefit classes:', fetchedClasses);
        setAvailableClasses(fetchedClasses.benefitClasses);
      } catch (error) {
        clientLogger.error('Error fetching benefit classes:', error);
      }
    };

    loadBenefitClasses();
  }, []);

  useEffect(() => {
    // Notify parent component of changes when number of classes changes
    if (onClassDataChange) {
      const classData = getClassData();
      clientLogger.info('Number of classes changed, notifying parent with class data:', classData);
      onClassDataChange(classData);
    }
  }, [numberOfClasses, benefits, availableClasses]);

  // Keep track of previous state to preserve benefits when number of classes changes
  const prevClassBenefits = useRef(classBenefits);

  useEffect(() => {
    // clientLogger.info('Number of classes changed to:', numberOfClasses);

    // Initialize class benefits map if number of classes changes
    const newClassBenefits = new Map<number, string[]>();

    // clientLogger.info(
    //   'Previous class benefits:',
    //   Object.fromEntries([...prevClassBenefits.current.entries()].map(([k, v]) => [k, v]))
    // );

    // Copy over existing benefits for classes that still exist
    for (let i = 0; i < numberOfClasses; i++) {
      if (prevClassBenefits.current.has(i)) {
        const existingBenefits = prevClassBenefits.current.get(i) || [];
        // clientLogger.info(`Keeping existing benefits for class ${i}:`, existingBenefits);
        newClassBenefits.set(i, existingBenefits);
      } else {
        // clientLogger.info(`Initializing empty benefits for new class ${i}`);
        newClassBenefits.set(i, []);
      }
    }

    // Update both the state and our ref
    // clientLogger.info(
    //   'Setting new class benefits map:',
    //   Object.fromEntries([...newClassBenefits.entries()].map(([k, v]) => [k, v]))
    // );
    setClassBenefits(newClassBenefits);
    prevClassBenefits.current = newClassBenefits;

    // Notify parent component of changes
    if (onClassDataChange) {
      const classData = getClassData();
      onClassDataChange(classData);
    }
  }, [numberOfClasses]);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer
        sx={{
          maxHeight: 'calc(100vh - 200px)', // Fixed height calculation based on viewport minus headers
          overflow: 'auto',
          '& .MuiTableHead-root': {
            position: 'sticky',
            top: 0,
            backgroundColor: 'background.paper',
            zIndex: 10,
            borderBottom: '2px solid rgba(224, 224, 224, 1)',
          },
        }}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Benefit Class</TableCell>
              <TableCell>Assigned Benefits</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: numberOfClasses }).map((_, index) => {
              const benefitsForClass = classBenefits.get(index) || [];

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>Select Benefit Class</InputLabel>
                      <Select
                        label="Select Benefit Class"
                        defaultValue=""
                        onChange={(e) => {
                          const classId = e.target.value as string;
                          setSelectedClasses((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(index, classId);
                            return newMap;
                          });
                          setClassBenefits((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(index, [...benefitsForClass]);
                            return newMap;
                          });

                          // Notify parent component of changes
                          if (onClassDataChange) {
                            const classData = getClassData();
                            // clientLogger.info('Class data changed:', classData);
                            onClassDataChange(classData);
                          }
                        }}
                      >
                        <MenuItem value="">Select Benefit Class</MenuItem>
                        {availableClasses.map((benefitClass) => (
                          <MenuItem value={benefitClass.id} key={benefitClass.id}>
                            {benefitClass.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {formatBenefits(benefitsForClass)}
                      </div>
                      {availableClasses[index]?.id && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(availableClasses[index]!.id, index)}
                          style={{ marginLeft: '8px' }}
                        >
                          <EditIcon />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <BenefitAssignmentDialog
        open={open}
        onClose={handleClose}
        benefits={benefits}
        selectedBenefits={selectedBenefits}
        onBenefitSelect={handleBenefitSelect}
        onSave={handleSave}
        rowIndex={selectedRow || 0}
      />
    </Box>
  );
};

export default BenefitClassTable;
