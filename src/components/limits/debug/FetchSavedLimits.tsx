import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useGetLimitStructuresQuery } from '../../../store/apis/limitApi';

const FetchSavedLimits: React.FC = () => {
  const { data: limitStructures, error, isLoading } = useGetLimitStructuresQuery();

  if (isLoading) {
    return <Typography>Loading limit structures...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading limit structures</Typography>;
  }

  if (!limitStructures || limitStructures.length === 0) {
    return <Typography>No limit structures found</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Saved Limit Structures
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Effective Date</TableCell>
              <TableCell>Market Segment</TableCell>
              <TableCell>Product Type</TableCell>
              <TableCell>Limits Count</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Last Modified</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {limitStructures.map((structure) => (
              <TableRow key={structure._id}>
                <TableCell>{structure.name}</TableCell>
                <TableCell>{structure.effectiveDate}</TableCell>
                <TableCell>{structure.marketSegment}</TableCell>
                <TableCell>{structure.productType}</TableCell>
                <TableCell>{structure.limits.length}</TableCell>
                <TableCell>{structure.createdBy}</TableCell>
                <TableCell>{new Date(structure.lastModifiedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FetchSavedLimits;
