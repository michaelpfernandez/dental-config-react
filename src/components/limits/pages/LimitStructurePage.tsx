import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LimitStructureDetails from '../summary/LimitStructureDetails';
import {
  useGetLimitStructureByIdQuery,
  useUpdateLimitStructureMutation,
} from '../../../store/apis/limitApi';

const LimitStructurePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: limitStructure, isLoading, error } = useGetLimitStructureByIdQuery(id || '');
  const [updateLimitStructure] = useUpdateLimitStructureMutation();

  const handleSave = async (updatedData: typeof limitStructure) => {
    try {
      if (!updatedData) {
        throw new Error('No data to update');
      }

      const updatePayload = {
        id: id || '',
        limitData: updatedData
      };
      await updateLimitStructure(updatePayload).unwrap();
      navigate('/limits');
    } catch (error) {
      // Error is already handled by the mutation error state
    }
  };

  const handleBack = () => {
    navigate('/limits');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">
          Error loading limit structure
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Limits
        </Button>
      </Box>
    );
  }

  if (!limitStructure) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">
          Limit structure not found
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Limits
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h5" component="h1">
          {id ? 'Edit Limit Structure' : 'Create Limit Structure'}
        </Typography>
      </Box>

      <LimitStructureDetails limitStructure={limitStructure} onSave={handleSave} />
    </Box>
  );
};

export default LimitStructurePage;
