import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Container, Box, Divider, Paper } from '@mui/material';
import EditableSummaryCard, { PlanSummary } from '../card/EditableSummaryCard';
import BenefitClassTable from '../table/BenefitClassTable';
import { SaveButtons } from '../common/SaveButtons';
import { useActionBar } from '../../../context/ActionBarContext';
import {
  useCreateBenefitClassStructureMutation,
  useUpdateBenefitClassStructureMutation,
} from '../../../store/apis/benefitClassApi';
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

  // Get the action bar context
  const { setActions, clearActions } = useActionBar();

  // Redux mutation hooks
  const [createBenefitClassStructure, { isLoading: isCreating }] =
    useCreateBenefitClassStructureMutation();
  const [updateBenefitClassStructure, { isLoading: isUpdating }] =
    useUpdateBenefitClassStructureMutation();

  useEffect(() => {
    setLoading(false);
    setError(null);

    // Update isSaving when mutation state changes
    setIsSaving(isCreating || isUpdating);

    // Set up the action bar buttons when the component mounts
    setActions([
      {
        id: 'save-button',
        component: <SaveButtons onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />,
      },
    ]);

    // Clear actions when component unmounts
    return () => clearActions();
  }, [setActions, clearActions, isCreating, isUpdating, planSummary]);

  // State to store class data from BenefitClassTable
  const [classData, setClassData] = useState<
    Array<{ id: string; name: string; benefits: Array<{ id: string; name: string }> }>
  >([]);

  // Function to handle class data changes from BenefitClassTable
  const handleClassDataChange = (
    newClassData: Array<{
      id: string;
      name: string;
      benefits: Array<{ id: string; name: string }>;
    }>
  ) => {
    setClassData(newClassData);
    clientLogger.info('Received updated class data from table:', newClassData);
  };

  // Function to transform component state into API payload format
  const preparePayload = () => {
    return {
      name: planSummary.className,
      effectiveDate: planSummary.effectiveDate,
      marketSegment: planSummary.marketSegment,
      productType: planSummary.productType,
      numberOfClasses: planSummary.numberOfClasses,
      classes: classData,
    };
  };

  // Handle saving the benefit class structure
  const handleSave = async () => {
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

      // Log current state for debugging
      clientLogger.info('Current plan summary:', planSummary);
      clientLogger.info('Current class data:', classData);

      // Prepare the payload
      const payload = preparePayload();
      clientLogger.info('Saving benefit class structure with payload:', payload);

      // Call the API to create a new benefit class structure
      clientLogger.info('Calling createBenefitClassStructure mutation...');
      const result = await createBenefitClassStructure(payload).unwrap();
      clientLogger.info('Successfully saved benefit class structure:', result);

      // Show success message or redirect
      alert('Benefit class structure saved successfully!');
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      clientLogger.error('Error saving benefit class structure:', err);
      setError(errorMessage);
      alert(`Error saving benefit class structure: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle canceling changes
  const handleCancel = () => {
    clientLogger.info('Canceling changes');
    // Reset to original form data
    setPlanSummary({
      effectiveDate: formData.effectiveDate,
      className: formData.className,
      marketSegment: formData.marketSegment,
      productType: formData.productType,
      numberOfClasses: formData.numberOfClasses,
    });
  };

  const handleSummaryUpdate = (updatedSummary: PlanSummary & { numberOfClasses: number }) => {
    setPlanSummary(updatedSummary);
    clientLogger.info('Updated plan summary:', updatedSummary);
  };

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
