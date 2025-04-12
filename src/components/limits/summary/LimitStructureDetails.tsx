import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from '@mui/material';
import { EditIcon } from '../../benefit-classes/common/icons';
import { ConfirmationButtons } from '../../benefit-classes/common/ConfirmationButtons';
import { LimitStructure, Limit } from '../../../types/limitStructure';
import { LimitIntervalType } from '../../../types/enums';
import { getDisplayName } from '../../../types/displayNames';

interface LimitStructureDetailsProps {
  limitStructure: LimitStructure;
  onSave: (data: LimitStructure) => void;
}

const LimitStructureDetails: React.FC<LimitStructureDetailsProps> = ({
  limitStructure,
  onSave,
}) => {
  const [data, setData] = useState<LimitStructure>(limitStructure);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange =
    (field: keyof LimitStructure) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleLimitChange =
    (classId: string, benefitId: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Limit) => {
      setData((prev) => {
        const updatedLimits = prev.limits.map((limit) => {
          if (limit.classId === classId && limit.benefitId === benefitId) {
            return {
              ...limit,
              [field]: event.target.value,
            };
          }
          return limit;
        });

        return {
          ...prev,
          limits: updatedLimits,
        };
      });
    };

  const handleDone = () => {
    onSave(data);
    setIsEditing(false);
  };

  // Group benefits by class
  const benefitsByClass = data.limits.reduce(
    (acc, limit) => {
      if (!acc[limit.classId]) {
        acc[limit.classId] = [];
      }
      acc[limit.classId].push(limit);
      return acc;
    },
    {} as Record<string, Limit[]>,
  );

  return (
    <div>
      {/* Summary Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">Limit Structure Details</Typography>
            </Grid>
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
                label="Description"
                value={data.description}
                onChange={handleChange('description')}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Default Interval"
                value={data.defaultInterval}
                onChange={handleChange('defaultInterval')}
                disabled={!isEditing}
              >
                {Object.values(LimitIntervalType).map((interval) => (
                  <MenuItem key={interval} value={interval}>
                    {getDisplayName.limitInterval(interval)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          {!isEditing ? (
            <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <ConfirmationButtons onCancel={() => setIsEditing(false)} onDone={handleDone} />
          )}
        </CardActions>
      </Card>

      {/* Benefits Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Benefit ID</TableCell>
              <TableCell>Benefit Name</TableCell>
              <TableCell>Limit Value</TableCell>
              <TableCell>Interval</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(benefitsByClass).map(([classId, limits]) => (
              <React.Fragment key={classId}>
                {limits.map((limit, index) => (
                  <TableRow key={`${limit.classId}-${limit.benefitId}`}>
                    {index === 0 && <TableCell rowSpan={limits.length}>Class {classId}</TableCell>}
                    <TableCell>{limit.benefitId}</TableCell>
                    <TableCell>{limit.benefitName}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={limit.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLimitChange(classId, limit.benefitId)(e, 'quantity')}
                        disabled={!isEditing}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        value={limit.interval.type}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLimitChange(classId, limit.benefitId)(e, 'interval')}
                        disabled={!isEditing}
                        size="small"
                      >
                        {Object.values(LimitIntervalType).map((interval) => (
                          <MenuItem key={interval} value={interval}>
                            {getDisplayName.limitInterval(interval)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LimitStructureDetails;
