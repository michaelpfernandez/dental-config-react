import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Box,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Limit, LimitInterval } from '../../../types/limitStructure';
import { useGetBenefitClassStructureByIdQuery } from '../../../store/apis/benefitClassApi';

export interface LimitTableProps {
  limitStructureId: string;
  onLimitDataChange: (limits: Limit[]) => void;
}

const LimitTable: React.FC<LimitTableProps> = ({ limitStructureId, onLimitDataChange }) => {
  const { data: benefitClassStructure, isLoading } =
    useGetBenefitClassStructureByIdQuery(limitStructureId);
  const [limits, setLimits] = useState<Limit[]>([]);

  // Initialize limits when benefit class structure is loaded
  useEffect(() => {
    if (benefitClassStructure) {
      // Create initial limits for each benefit in each class
      const initialLimits: Limit[] = benefitClassStructure.classes.flatMap((classData) =>
        classData.benefits.map((benefit) => ({
          id: `${classData.id}-${benefit.code}`,
          classId: classData.id,
          className: classData.name,
          benefitCode: benefit.code,
          benefitName: benefit.name,
          value: 0,
          interval: { type: 'per_year', value: 1 },
          type: 'n/a',
        }))
      );
      setLimits(initialLimits);
      onLimitDataChange(initialLimits);
    }
  }, [benefitClassStructure, onLimitDataChange]);

  const handleLimitChange = (limitId: string, field: keyof Limit, value: any) => {
    const newLimits = limits.map((limit) =>
      limit.id === limitId ? { ...limit, [field]: value } : limit
    );
    setLimits(newLimits);
    onLimitDataChange(newLimits);
  };

  const formatIntervalType = (type: string): string => {
    switch (type) {
      case 'per_visit':
        return 'Per Visit';
      case 'per_year':
        return 'Per Year';
      case 'per_lifetime':
        return 'Per Lifetime';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!benefitClassStructure) {
    return <Typography color="error">Error: Could not load benefit class structure</Typography>;
  }

  // Group limits by class
  const limitsByClass = limits.reduce(
    (acc, limit) => {
      if (!acc[limit.classId]) {
        acc[limit.classId] = [];
      }
      acc[limit.classId].push(limit);
      return acc;
    },
    {} as Record<string, Limit[]>
  );

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer
        sx={{
          maxHeight: 'calc(100vh - 250px)',
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
        <Table stickyHeader aria-label="limits table">
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Benefit</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Interval</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(limitsByClass).map(([classId, classLimits]) => (
              <React.Fragment key={classId}>
                {classLimits.map((limit, index) => (
                  <TableRow key={limit.id}>
                    {index === 0 && (
                      <TableCell rowSpan={classLimits.length}>{limit.className}</TableCell>
                    )}
                    <TableCell>{limit.benefitName}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={limit.value}
                        onChange={(e) =>
                          handleLimitChange(limit.id, 'value', Number(e.target.value))
                        }
                        size="small"
                        inputProps={{ min: 0, max: 99, style: { width: '50px' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={limit.type}
                        onChange={(e) => handleLimitChange(limit.id, 'type', e.target.value)}
                        size="small"
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value="per_tooth">Per Tooth</MenuItem>
                        <MenuItem value="per_item">Per Item</MenuItem>
                        <MenuItem value="n/a">N/A</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={limit.interval.type}
                        onChange={(e) =>
                          handleLimitChange(limit.id, 'interval', {
                            type: e.target.value,
                            value: 1,
                          })
                        }
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="per_visit">Per Visit</MenuItem>
                        <MenuItem value="per_year">Per Year</MenuItem>
                        <MenuItem value="per_lifetime">Per Lifetime</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LimitTable;
