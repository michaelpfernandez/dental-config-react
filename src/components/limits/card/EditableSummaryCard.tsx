import React, { useState } from 'react';
import { Card, CardContent, CardActions, TextField, Button, Grid } from '@mui/material';
import { EditIcon } from '../../benefit-classes/common/icons';
import { ConfirmationButtons } from '../../benefit-classes/common/ConfirmationButtons';
import { LimitFormData } from '../../../types/limitStructure';

interface EditableSummaryCardProps {
  initialData: LimitFormData;
  onSave: (data: LimitFormData) => void;
}

const EditableSummaryCard: React.FC<EditableSummaryCardProps> = ({ initialData, onSave }) => {
  const [data, setData] = useState<LimitFormData>(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange =
    (field: keyof LimitFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleDone = () => {
    onSave(data);
    setIsEditing(false);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={data.name}
              onChange={handleChange('name')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Effective Date"
              type="date"
              value={data.effectiveDate}
              onChange={handleChange('effectiveDate')}
              disabled={!isEditing}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Market Segment"
              value={data.marketSegment}
              onChange={handleChange('marketSegment')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Type"
              value={data.productType}
              onChange={handleChange('productType')}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Benefit Class Structure"
              value={data.benefitClassStructureName}
              disabled
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        {isEditing ? (
          <ConfirmationButtons onDone={handleDone} onCancel={() => setIsEditing(false)} />
        ) : (
          <Button variant="outlined" onClick={() => setIsEditing(true)} startIcon={<EditIcon />}>
            Edit
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default EditableSummaryCard;
