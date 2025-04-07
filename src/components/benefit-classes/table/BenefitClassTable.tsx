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
import { clientLogger } from '../../../utils/clientLogger';
import BenefitAssignmentDialog from '../dialogs/BenefitAssignmentDialog';

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
    clientLogger.info(
      'Editing benefits for class:',
      rowIndex,
      'Current benefits:',
      currentBenefits
    );
    setOpen(true);
  };

  const handleBenefitSelect = (benefitIds: string[]) => {
    clientLogger.info('Benefit selection in dialog:', benefitIds);
    setSelectedBenefits(benefitIds);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBenefits([]);
    setSelectedRow(null);
  };

  // Helper function to get the current class data
  const getClassData = () => {
    const classData: Array<{
      id: string;
      name: string;
      benefits: Array<{ id: string; name: string }>;
    }> = [];

    clientLogger.info('Getting class data, number of classes:', numberOfClasses);
    clientLogger.info(
      'Current classBenefits map:',
      Object.fromEntries([...classBenefits.entries()].map(([k, v]) => [k, v]))
    );

    for (let i = 0; i < numberOfClasses; i++) {
      const classId = selectedClasses.get(i) || '';
      const className = availableClasses.find((c) => c.id === classId)?.name || `Class ${i + 1}`;
      const benefitIds = classBenefits.get(i) || [];

      clientLogger.info(
        `Class ${i + 1} (${className}) has ${benefitIds.length} benefit IDs:`,
        benefitIds
      );

      // Convert benefit.id to string to match the type in benefitIds
      const benefitsForClass = benefits
        .filter((benefit) => benefitIds.includes(String(benefit.id)))
        .map((benefit) => ({ id: String(benefit.id), name: benefit.name }));

      clientLogger.info(
        `Class ${i + 1} (${className}) mapped to ${benefitsForClass.length} benefit objects:`,
        benefitsForClass
      );

      classData.push({
        id: classId || `class-${i + 1}`,
        name: className,
        benefits: benefitsForClass,
      });
    }

    return classData;
  };

  const handleSave = () => {
    if (selectedRow !== null) {
      clientLogger.info(
        'Saving benefits for class:',
        selectedRow,
        'Selected benefits:',
        selectedBenefits
      );

      setClassBenefits((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectedRow, [...selectedBenefits]);
        clientLogger.info(
          'Updated class benefits map:',
          Object.fromEntries([...newMap.entries()].map(([k, v]) => [k, v]))
        );
        return newMap;
      });

      // Notify parent component of changes
      if (onClassDataChange) {
        const classData = getClassData();
        clientLogger.info('Benefits updated for class:', selectedRow);
        clientLogger.info(
          'Full class data being sent to parent:',
          JSON.stringify(classData, null, 2)
        );
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
        setBenefits(fetchedBenefits.benefits);
      } catch (error) {
        clientLogger.info('Error fetching benefits:', error);
      }
    };

    loadBenefits();
  }, []);

  useEffect(() => {
    const loadBenefitClasses = async () => {
      try {
        const fetchedClasses = await fetchBenefitClasses();
        setAvailableClasses(fetchedClasses.benefitClasses);
      } catch (error) {
        clientLogger.info('Error fetching benefit classes:', error);
      }
    };

    loadBenefitClasses();
  }, []);

  // Keep track of previous state to preserve benefits when number of classes changes
  const prevClassBenefits = useRef(classBenefits);

  useEffect(() => {
    clientLogger.info('Number of classes changed to:', numberOfClasses);

    // Initialize class benefits map if number of classes changes
    const newClassBenefits = new Map<number, string[]>();

    clientLogger.info(
      'Previous class benefits:',
      Object.fromEntries([...prevClassBenefits.current.entries()].map(([k, v]) => [k, v]))
    );

    // Copy over existing benefits for classes that still exist
    for (let i = 0; i < numberOfClasses; i++) {
      if (prevClassBenefits.current.has(i)) {
        const existingBenefits = prevClassBenefits.current.get(i) || [];
        clientLogger.info(`Keeping existing benefits for class ${i}:`, existingBenefits);
        newClassBenefits.set(i, existingBenefits);
      } else {
        clientLogger.info(`Initializing empty benefits for new class ${i}`);
        newClassBenefits.set(i, []);
      }
    }

    // Update both the state and our ref
    clientLogger.info(
      'Setting new class benefits map:',
      Object.fromEntries([...newClassBenefits.entries()].map(([k, v]) => [k, v]))
    );
    setClassBenefits(newClassBenefits);
    prevClassBenefits.current = newClassBenefits;

    // Notify parent component of changes
    if (onClassDataChange) {
      const classData = getClassData();
      clientLogger.info('Number of classes changed, updated class data:', classData);
      onClassDataChange(classData);
    }
  }, [numberOfClasses]); // Only run when numberOfClasses changes

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
                            clientLogger.info('Class data changed:', classData);
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
