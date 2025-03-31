import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Container } from '@mui/material';
import EditableSummaryCard, { PlanSummary } from '../card/EditableSummaryCard';
import BenefitClassTable from '../table/BenefitClassTable';

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

  useEffect(() => {
    setLoading(false);
    setError(null);
  }, []);

  const handleSummaryUpdate = (updatedSummary: PlanSummary & { numberOfClasses: number }) => {
    setPlanSummary(updatedSummary);
    // TODO: Save to backend or dispatch to Redux store if needed
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Plan Configuration
      </Typography>
      <EditableSummaryCard
        initialData={planSummary}
        onSave={handleSummaryUpdate}
        numberOfClasses={formData.numberOfClasses || 1}
      />
      <BenefitClassTable numberOfClasses={planSummary.numberOfClasses} />
    </Container>
  );
};

export default BenefitClassSummary;
