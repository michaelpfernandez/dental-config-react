import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Interface for the benefit class structure data
interface BenefitClassSummaryProps {
  className: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
  numberOfClasses: number;
  classes: Array<{
    id: string;
    name: string;
    benefits: any[];
  }>;
}

const BenefitClassSummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the benefit class data from location state
  const benefitClassData = location.state?.benefitClassData as BenefitClassSummaryProps;

  // If no data is available, show an error message
  if (!benefitClassData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error" gutterBottom>
          Error: No benefit class data available
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/benefit-classes/create')}
        >
          Return to Form
        </Button>
      </Box>
    );
  }

  // Format the date for display
  const formattedDate = benefitClassData.effectiveDate
    ? new Date(benefitClassData.effectiveDate).toLocaleDateString()
    : 'Not specified';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/benefit-classes/create')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Benefit Class Summary</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {benefitClassData.className}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Effective Date
            </Typography>
            <Typography variant="body1">{formattedDate}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Market Segment
            </Typography>
            <Typography variant="body1">{benefitClassData.marketSegment}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Product Type
            </Typography>
            <Typography variant="body1">{benefitClassData.productType}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Class Structure ({benefitClassData.numberOfClasses} classes)
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class ID</TableCell>
                <TableCell>Class Name</TableCell>
                <TableCell>Number of Benefits</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {benefitClassData.classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>{classItem.id}</TableCell>
                  <TableCell>{classItem.name || 'Not specified'}</TableCell>
                  <TableCell>{classItem.benefits.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/benefit-classes')}>
          Done
        </Button>
        <Button variant="outlined" onClick={() => navigate('/benefit-classes/create')}>
          Create Another
        </Button>
      </Box>
    </Box>
  );
};

export default BenefitClassSummary;
