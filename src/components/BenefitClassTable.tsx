import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { fetchBenefitClasses, fetchBenefitsList } from '../services/api';
import { clientLogger } from '../utils/clientLogger';
import BenefitAssignmentDialog from './BenefitAssignmentDialog';

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
}

const BenefitClassTable: React.FC<BenefitClassTableProps> = ({ numberOfClasses }) => {
  const [availableClasses, setAvailableClasses] = useState<BenefitClass[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [classBenefits, setClassBenefits] = useState<Map<number, string[]>>(new Map());

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

  const handleSave = () => {
    if (selectedRow !== null) {
      setClassBenefits((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectedRow, [...selectedBenefits]);
        return newMap;
      });
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

  return (
    <div>
      <TableContainer>
        <Table>
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
                          const classId = e.target.value;
                          setClassBenefits((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(index, [...benefitsForClass]);
                            return newMap;
                          });
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
                          Edit
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
    </div>
  );
};

export default BenefitClassTable;
