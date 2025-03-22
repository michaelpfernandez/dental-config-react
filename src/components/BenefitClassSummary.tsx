import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Container } from '@mui/material';
import EditableSummaryCard, { PlanSummary } from './EditableSummaryCard';
import BenefitClassTable, { BenefitClass } from './BenefitClassTable';

const BenefitClassSummary: React.FC<{ availableClasses: BenefitClass[] }> = ({
  availableClasses,
}) => {
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

  const handleClassSelect = (index: number, classId: string | null) => {
    // Removed the setSelectedClasses function call
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
      <BenefitClassTable
        numberOfClasses={formData.numberOfClasses || 1}
        availableClasses={availableClasses}
        onClassSelect={handleClassSelect}
      />
    </Container>
  );
};

export default BenefitClassSummary;
