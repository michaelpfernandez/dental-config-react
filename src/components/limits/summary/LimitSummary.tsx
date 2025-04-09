import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import { LimitFormData, Limit } from '../../../types/limitStructure';
import { useActionBar } from '../../../context/ActionBarContext';
import { SaveButtons } from '../../benefit-classes/common/SaveButtons';
import { clientLogger } from '../../../utils/clientLogger';
import LimitTable from '../table/LimitTable';
import EditableSummaryCard from '../card/EditableSummaryCard';

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
  const { setActions } = useActionBar();

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

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    // Set up the action bar buttons when the component mounts
    setActions([
      {
        id: 'save-button',
        component: <SaveButtons onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />,
      },
    ]);
  }, [setActions, isSaving]);

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
          Limit Structure Summary
        </Typography>
        <EditableSummaryCard
          initialData={limitData}
          onSave={(updatedData) => {
            setLimitData(updatedData);
          }}
        />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Benefit Limits
          </Typography>
          <LimitTable
            limitStructureId={limitData.benefitClassStructureId}
            onLimitDataChange={setLimits}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default LimitSummary;
