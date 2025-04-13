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
  Select,
  Input,
  SelectChangeEvent,
} from '@mui/material';
import { EditIcon } from '../../benefit-classes/common/icons';
import { ConfirmationButtons } from '../../benefit-classes/common/ConfirmationButtons';
import { LimitStructure, Limit } from '../../../types/limitStructure';
import { LimitIntervalType } from '../../../types/enums';
import { getDisplayName } from '../../../types/displayNames';
import { MarketSegment } from '../../../types/enums';

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

  const handleTextFieldChange =
    (field: keyof LimitStructure) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSelectChange =
    (field: keyof LimitStructure) => (event: SelectChangeEvent) => {
      setData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleLimitTextFieldChange =
    (classId: string, benefitId: string, field: keyof Limit) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      
      setData((prev) => {
        const updatedLimits = prev.limits.map((limit) => {
          if (limit.classId === classId && limit.benefitId === benefitId) {
            if (field === 'interval') {
              return {
                ...limit,
                interval: { type: value as LimitIntervalType, value: limit.interval.value },
              };
            }
            return {
              ...limit,
              [field]: value,
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

  const handleLimitSelectChange =
    (classId: string, benefitId: string, field: keyof Limit) =>
    (event: SelectChangeEvent) => {
      const value = event.target.value;
      
      setData((prev) => {
        const updatedLimits = prev.limits.map((limit) => {
          if (limit.classId === classId && limit.benefitId === benefitId) {
            if (field === 'interval') {
              return {
                ...limit,
                interval: { type: value as LimitIntervalType, value: limit.interval.value },
              };
            }
            return {
              ...limit,
              [field]: value,
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
                onChange={handleTextFieldChange('name')}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                label="Market Segment"
                value={data.marketSegment}
                onChange={handleSelectChange('marketSegment')}
                disabled={!isEditing}
                input={<Input />}
              >
                {Object.values(MarketSegment).map((segment) => (
                  <MenuItem key={segment} value={segment}>
                    {getDisplayName.marketSegment(segment)}
                  </MenuItem>
                ))}
              </Select>
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
                        onChange={handleLimitTextFieldChange(classId, limit.benefitId, 'quantity')}
                        disabled={!isEditing}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={limit.interval.type}
                        onChange={handleLimitSelectChange(classId, limit.benefitId, 'interval')}
                        disabled={!isEditing}
                        size="small"
                        input={<Input />}
                      >
                        {Object.values(LimitIntervalType).map((interval) => (
                          <MenuItem key={interval} value={interval}>
                            {getDisplayName.limitInterval(interval)}
                          </MenuItem>
                        ))}
                      </Select>
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
