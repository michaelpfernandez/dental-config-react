import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { clientLogger } from '../../../utils/clientLogger';
import { Container, Box, Typography } from '@mui/material';
import { LimitFormData, Limit } from '../../../types/limitStructure';
import { useActionBar } from '../../../context/ActionBarContext';
import { SaveButtons } from '../../benefit-classes/common/SaveButtons';
import LimitTable from '../table/LimitTable';
import EditableSummaryCard from '../card/EditableSummaryCard';
import { useCreateLimitStructureMutation } from '../../../store/apis/limitApi';

const LimitSummary: React.FC = () => {
  const location = useLocation();
  const formData = location.state as LimitFormData;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redux mutation hooks
  const [createLimit, { isLoading: isCreating }] = useCreateLimitStructureMutation();

  const [limitData, setLimitData] = useState<LimitFormData>({
    name: formData.name,
    effectiveDate: formData.effectiveDate,
    marketSegment: formData.marketSegment,
    productType: formData.productType,
    benefitClassStructureId: formData.benefitClassStructureId,
    benefitClassStructureName: formData.benefitClassStructureName,
    limits: [], // Initialize empty limits array
  });

  // Placeholder for limits data that would come from the benefit class structure
  const [limits, setLimits] = useState<Limit[]>([]);

  // Get the action bar context
  const { setActions, clearActions } = useActionBar();

  // Function to prepare the payload for the API
  const preparePayload = () => {
    // Validate limit data completeness
    const missingFields = limits
      .map((limit) => {
        const missing = [];
        if (!limit.benefitId) missing.push('benefitId');
        if (limit.quantity === undefined) missing.push('quantity');
        if (!limit.unit) missing.push('unit');
        if (!limit.interval?.type) missing.push('interval.type');
        return { id: limit.id, benefitName: limit.benefitName, missingFields: missing };
      })
      .filter((item) => item.missingFields.length > 0);

    if (missingFields.length > 0) {
      clientLogger.info('Missing fields in limit data:', { missingFields });
    }

    clientLogger.info('Complete limit data:', {
      limits: limits.map((limit) => ({
        id: limit.id,
        benefitName: limit.benefitName,
        quantity: limit.quantity,
        unit: limit.unit,
        interval: limit.interval,
      })),
    });

    const currentTime = new Date();
    const currentUser = 'current_user'; // This should be replaced with actual user info

    return {
      limitConfig: {
        name: limitData.name,
        effectiveDate: limitData.effectiveDate,
        marketSegment: limitData.marketSegment,
        productType: limitData.productType,
        benefitClassStructureId: limitData.benefitClassStructureId,
        benefitClassStructureName: limitData.benefitClassStructureName || 'Default Structure',
        limits: limits.map((limit) => ({
          id: limit.id,
          classId: limit.classId,
          className: limit.className,
          benefitId: limit.benefitId,
          benefitName: limit.benefitName,
          quantity: limit.quantity,
          unit: limit.unit,
          interval: limit.interval,
        })),
        createdBy: currentUser,
        createdAt: currentTime,
        lastModifiedBy: currentUser,
        lastModifiedAt: currentTime,
      }
    };
  };

  // Function to handle save action
  const handleSave = async () => {
    clientLogger.info('Starting save operation');
    try {
      setIsSaving(true);
      setError(null);

      // Validate required fields
      if (!limitData.name) {
        throw new Error('Name is required');
      }
      if (!limitData.effectiveDate) {
        throw new Error('Effective date is required');
      }
      if (!limitData.marketSegment) {
        throw new Error('Market segment is required');
      }
      if (!limitData.productType) {
        throw new Error('Product type is required');
      }
      if (!limitData.benefitClassStructureId) {
        throw new Error('Benefit class structure is required');
      }

      // Prepare and log the payload
      const payload = preparePayload();
      clientLogger.info('Saving with payload:', { payload });

      // Call the API with the limitConfig object
      const result = await createLimit({ limitConfig: payload.limitConfig }).unwrap();
      clientLogger.info('Save successful:', { result });

      // Update UI state
      setIsDirty(false);
      alert('Limit structure saved successfully!');
    } catch (err) {
      // Extract error message
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check if this is a MongoDB validation error
        if (errorMessage.includes('validation failed')) {
          const validationMessage = errorMessage.split('validation failed: ')[1];
          if (validationMessage) {
            errorMessage = `Validation error: ${validationMessage}`;
          }
        }
      }
      clientLogger.error('Save operation failed:', { error: errorMessage });
      setError(errorMessage);
      alert(`Error saving limit structure: ${errorMessage}`);
    } finally {
      setIsSaving(false);
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

  // Set up action bar and handle state changes
  useEffect(() => {
    setLoading(false);
    setError(null);
    setIsSaving(isCreating);

    // Set up the action bar buttons
    setActions([
      {
        id: 'save-button',
        component: (
          <SaveButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            disabled={!isDirty}
          />
        ),
      },
    ]);

    // Clear actions when component unmounts
    return () => clearActions();
  }, [setActions, clearActions, isCreating]);

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
            setIsDirty(true);
          }}
        />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Benefit Limits
          </Typography>
          <LimitTable
            limitStructureId={limitData.benefitClassStructureId}
            onLimitDataChange={(newLimits) => {
              setLimits(newLimits);
              setIsDirty(true);
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default LimitSummary;
