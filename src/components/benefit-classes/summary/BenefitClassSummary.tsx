import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Container, Box } from '@mui/material';
import EditableSummaryCard, { PlanSummary } from '../card/EditableSummaryCard';
import BenefitClassTable from '../table/BenefitClassTable';
import { SaveButtons } from '../common/SaveButtons';
import { useActionBar } from '../../../context/ActionBarContext';
import { useCreateBenefitClassStructureMutation } from '../../../store/apis/benefitClassApi';
import { clientLogger } from '../../../utils/clientLogger';

const BenefitClassSummary: React.FC = () => {
  const location = useLocation();
  const formData = location.state as PlanSummary & { numberOfClasses: number };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [planSummary, setPlanSummary] = useState<PlanSummary & { numberOfClasses: number }>({
    effectiveDate: formData.effectiveDate,
    className: formData.className,
    marketSegment: formData.marketSegment,
    productType: formData.productType,
    numberOfClasses: formData.numberOfClasses,
  });

  const [classData, setClassData] = useState<
    Array<{ id: string; name: string; benefits: Array<{ id: string; name: string }> }>
  >([]);

  // Get the action bar context
  const { setActions, clearActions } = useActionBar();

  // Redux mutation hooks
  const [createBenefitClassStructure, { isLoading: isCreating }] =
    useCreateBenefitClassStructureMutation();

  // Effect for handling save button state
  useEffect(() => {
    setIsSaving(isCreating);
  }, [isCreating]);

  // Function to handle class data changes from BenefitClassTable
  const handleClassDataChange = (
    newClassData: Array<{
      id: string;
      name: string;
      benefits: Array<{ id: string; name: string }>;
    }>,
  ) => {
    clientLogger.info('Received class data from table:', newClassData);
    setClassData(newClassData);
  };

  // Function to transform component state into API payload format
  const preparePayload = () => {
    const payload = {
      name: planSummary.className,
      effectiveDate: planSummary.effectiveDate,
      marketSegment: planSummary.marketSegment,
      productType: planSummary.productType,
      numberOfClasses: planSummary.numberOfClasses,
      classes: classData,
    };
    return payload;
  };

  // Handle saving the benefit class structure
  const handleSave = useCallback(async () => {
    clientLogger.info('Current class data before save:', classData);
    try {
      setIsSaving(true);
      setError(null);

      // Validate required fields
      if (!planSummary.className) {
        throw new Error('Class name is required');
      }
      if (!planSummary.effectiveDate) {
        throw new Error('Effective date is required');
      }
      if (!planSummary.marketSegment) {
        throw new Error('Market segment is required');
      }
      if (!planSummary.productType) {
        throw new Error('Product type is required');
      }

      // Prepare the payload
      const payload = preparePayload();
      clientLogger.info('Sending payload to create benefit class structure:', payload);

      // Call the API to create a new benefit class structure
      const result = await createBenefitClassStructure(payload).unwrap();
      clientLogger.info('Received response from create benefit class structure:', result);

      // Show success message or redirect
      alert('Benefit class structure saved successfully!');
    } catch (err) {
      // Extract error message from MongoDB validation error
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check if this is a MongoDB validation error
        if (errorMessage.includes('validation failed')) {
          // Extract the specific validation error message
          const validationMessage = errorMessage.split('validation failed: ')[1];
          if (validationMessage) {
            errorMessage = `Validation error: ${validationMessage}`;
          }
        }
      }
      setError(errorMessage);
      alert(`Error saving benefit class structure: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  }, [planSummary, createBenefitClassStructure]);

  // Handle canceling changes
  const handleCancel = useCallback(() => {
    // Reset to original form data
    setPlanSummary({
      effectiveDate: formData.effectiveDate,
      className: formData.className,
      marketSegment: formData.marketSegment,
      productType: formData.productType,
      numberOfClasses: formData.numberOfClasses,
    });
  }, [formData]);

  const handleSummaryUpdate = (updatedSummary: PlanSummary & { numberOfClasses: number }) => {
    setPlanSummary(updatedSummary);
  };

  // Effect for setting up action bar buttons
  useEffect(() => {
    setLoading(false);
    setError(null);

    // Set up the action bar buttons when the component mounts
    setActions([
      {
        id: 'save-button',
        component: <SaveButtons onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />,
      },
    ]);

    // Clear actions when component unmounts
    return () => clearActions();
  }, [setActions, clearActions, handleSave, handleCancel, isSaving]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Fixed header content */}
      <Container maxWidth="lg" sx={{ flex: '0 0 auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
          Plan Configuration
        </Typography>

        <EditableSummaryCard
          initialData={planSummary}
          onSave={handleSummaryUpdate}
          numberOfClasses={formData.numberOfClasses || 1}
        />
      </Container>

      {/* Scrollable content */}
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Container
          maxWidth="lg"
          sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}
        >
          {/* Add a wrapper for the BenefitClassTable to control its layout */}
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 8 }}>
            {' '}
            {/* Add margin at bottom for last row */}
            <BenefitClassTable
              numberOfClasses={planSummary.numberOfClasses}
              onClassDataChange={handleClassDataChange}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default BenefitClassSummary;
