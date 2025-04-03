import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Container, Box, Divider, Paper } from '@mui/material';
import EditableSummaryCard, { PlanSummary } from '../card/EditableSummaryCard';
import BenefitClassTable from '../table/BenefitClassTable';
import { SaveButtons } from '../common/SaveButtons';
import { useActionBar } from '../../../context/ActionBarContext';

const BenefitClassSummary: React.FC = () => {
  const location = useLocation();
  const formData = location.state as PlanSummary & { numberOfClasses: number };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planSummary, setPlanSummary] = useState<PlanSummary & { numberOfClasses: number }>({
    effectiveDate: formData.effectiveDate,
    className: formData.className,
    marketSegment: formData.marketSegment,
    productType: formData.productType,
    numberOfClasses: formData.numberOfClasses,
  });

  // Get the action bar context
  const { setActions, clearActions } = useActionBar();

  useEffect(() => {
    setLoading(false);
    setError(null);

    // Set up the action bar buttons when the component mounts
    setActions([
      {
        id: 'save-button',
        component: (
          <SaveButtons
            onSave={() => {
              // Will implement actual database save functionality later
              console.log('Saving benefit class structure to database:', planSummary);
            }}
            onCancel={() => {
              // Will implement cancel functionality later
              console.log('Canceling changes');
            }}
          />
        ),
      },
    ]);

    // Clear actions when component unmounts
    return () => clearActions();
  }, [setActions, clearActions]);

  const handleSummaryUpdate = (updatedSummary: PlanSummary & { numberOfClasses: number }) => {
    setPlanSummary(updatedSummary);
    // TODO: Save to backend or dispatch to Redux store if needed
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
            <BenefitClassTable numberOfClasses={planSummary.numberOfClasses} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default BenefitClassSummary;
