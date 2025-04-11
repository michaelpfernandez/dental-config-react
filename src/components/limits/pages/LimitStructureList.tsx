import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LimitStructure } from '../../../types/limitStructure';
import { MarketSegment, ProductType, LimitIntervalType } from '../../../types/enums';

const LimitStructureList: React.FC = () => {
  const navigate = useNavigate();
  const [limitStructures, setLimitStructures] = useState<LimitStructure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll simulate with a timeout
    const fetchLimitStructures = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockLimitStructures: LimitStructure[] = [
          {
            _id: 'limit-structure-1',
            name: 'Standard Dental Limits',
            effectiveDate: '2025-01-01',
            marketSegment: MarketSegment.Individual,
            productType: ProductType.PPO,
            benefitClassStructureId: 'class-structure-1',
            benefitClassStructureName: 'Standard Dental Class Structure',
            limits: [
              {
                id: 'limit-1',
                benefitId: 'benefit-1',
                benefitName: 'Preventive Care',
                quantity: 2,
                interval: {
                  type: LimitIntervalType.PerYear,
                  value: 1,
                },
              },
            ],
            createdAt: new Date('2025-03-15T10:30:00Z'),
            lastModifiedAt: new Date('2025-03-15T10:30:00Z'),
          },
          {
            _id: 'limit-structure-2',
            name: 'Premium Dental Limits',
            effectiveDate: '2025-02-01',
            marketSegment: MarketSegment.Individual,
            productType: ProductType.PPO,
            benefitClassStructureId: 'class-structure-2',
            benefitClassStructureName: 'Premium Dental Class Structure',
            limits: [
              {
                id: 'limit-2',
                benefitId: 'benefit-2',
                benefitName: 'Basic Restorative',
                quantity: 3,
                interval: {
                  type: LimitIntervalType.PerYear,
                  value: 1,
                },
              },
            ],
            createdAt: new Date('2025-03-20T14:45:00Z'),
            lastModifiedAt: new Date('2025-03-20T14:45:00Z'),
          },
        ];

        setLimitStructures(mockLimitStructures);
      } catch (err) {
        setError('Failed to fetch limit structures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimitStructures();
  }, []);

  const handleCreateNew = () => {
    navigate('/limits/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/limits/${id}`);
  };

  const handleDelete = (id: string) => {
    // In a real app, you would call an API to delete
    // For now, we'll just filter the local state
    setLimitStructures((prevStructures) =>
      prevStructures.filter((structure) => structure._id !== id)
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Limit Structures
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New Limit Structure
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Market Segment</TableCell>
                <TableCell>Product Type</TableCell>
                <TableCell>Benefit Class Structure</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Last Modified At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {limitStructures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No limit structures found. Click "Create New Limit Structure" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                limitStructures.map((structure) => (
                  <TableRow key={structure._id}>
                    <TableCell>{structure.name}</TableCell>
                    <TableCell>{structure.effectiveDate}</TableCell>
                    <TableCell>{structure.marketSegment}</TableCell>
                    <TableCell>{structure.productType}</TableCell>
                    <TableCell>{structure.benefitClassStructureName}</TableCell>
                    <TableCell>
                      {structure.createdAt ? structure.createdAt.toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {structure.lastModifiedAt
                        ? structure.lastModifiedAt.toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(structure._id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(structure._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LimitStructureList;
