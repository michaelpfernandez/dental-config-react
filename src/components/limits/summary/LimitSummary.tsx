import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Container, Box } from '@mui/material';
import { LimitFormData, Limit } from '../../../types/limitStructure';
import { useActionBar } from '../../../context/ActionBarContext';
import { SaveButtons } from '../../benefit-classes/common/SaveButtons';
import { clientLogger } from '../../../utils/clientLogger';

const LimitSummary: React.FC = () => {
  const location = useLocation();
  const formData = location.state as LimitFormData;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [limitData, setLimitData] = useState<LimitFormData>({
    name: formData.name,
    effectiveDate: formData.effectiveDate,
    marketSegment: formData.marketSegment,
    productType: formData.productType,
    benefitClassStructureId: formData.benefitClassStructureId,
    benefitClassStructureName: formData.benefitClassStructureName,
  });

  // Placeholder for limits data that would come from the benefit class structure
  const [limits, setLimits] = useState<Limit[]>([]);

  // Get the action bar context
  const { setActions, clearActions } = useActionBar();

  useEffect(() => {
    setLoading(false);

    // Set up the action bar buttons when the component mounts
    setActions([
      {
        label: 'Save',
        onClick: handleSave,
        disabled: isSaving,
      },
      {
        label: 'Cancel',
        onClick: handleCancel,
        disabled: isSaving,
      },
    ]);

    // Clear actions when component unmounts
    return () => clearActions();
  }, [setActions, clearActions, isSaving]);

  // Function to handle save action
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // In a real implementation, this would call an API to save the limit structure
      // For now, we'll just show a success message
      alert('Limit structure saved successfully!');

      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);

      // Extract error message
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      clientLogger.error('Error saving limit structure:', err);
    }
  };

  // Function to handle cancel action
  const handleCancel = () => {
    // Navigate back or to a specific page
    window.history.back();
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Limit Structure: {limitData.name}
        </Typography>

        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h6">Details</Typography>
          <Typography>Effective Date: {limitData.effectiveDate}</Typography>
          <Typography>Market Segment: {limitData.marketSegment}</Typography>
          <Typography>Product Type: {limitData.productType}</Typography>
          <Typography>Benefit Class Structure: {limitData.benefitClassStructureName}</Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Limits Configuration</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            This is where the limit configuration table will be displayed. You'll be able to set
            limits for each benefit in the selected benefit class structure.
          </Typography>
        </Box>

        <SaveButtons onSave={handleSave} onCancel={handleCancel} disabled={isSaving} />
      </Box>
    </Container>
  );
};

export default LimitSummary;
