import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
} from '@mui/material';
import { EditIcon } from './common/icons';
import { ConfirmationButtons } from './common/ConfirmationButtons';

export interface PlanSummary {
  effectiveDate: string;
  className: string;
  marketSegment: string;
  productType: string;
  numberOfClasses: number;
}

interface EditableSummaryCardProps {
  initialData: PlanSummary;
  onSave: (data: PlanSummary) => void;
  numberOfClasses: number;
}

const EditableSummaryCard: React.FC<EditableSummaryCardProps> = ({
  initialData,
  onSave,
  numberOfClasses,
}) => {
  const [data, setData] = useState<PlanSummary>({
    ...initialData,
    numberOfClasses: initialData.numberOfClasses ?? 1, // Default to 1 if null or undefined
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange =
    (field: keyof PlanSummary) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <Typography variant="h6" gutterBottom>
          Plan Summary
        </Typography>
        <Grid container spacing={2}>
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
              label="Class Name"
              value={data.className}
              onChange={handleChange('className')}
              disabled={!isEditing}
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
              label="Number of Classes"
              select
              value={data.numberOfClasses}
              onChange={handleChange('numberOfClasses')}
              disabled={!isEditing}
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </TextField>
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
