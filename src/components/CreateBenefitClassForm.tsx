import React from 'react';
import { Link } from 'react-router-dom';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Button,
  Input,
  Select,
  MenuItem,
} from '@mui/material';

interface PlanAttributes {
  effectiveDate: string;
  className: string;
  marketSegment: string;
  productType: string;
  numberOfClasses: number;
}

const CreateBenefitClassForm: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const defaultEffectiveDate = `${currentYear + 1}-01-01`;

  const [attributes, setAttributes] = React.useState<PlanAttributes>({
    effectiveDate: defaultEffectiveDate,
    className: '',
    marketSegment: '',
    productType: '',
    numberOfClasses: 4,
  });

  const handleChange = (field: keyof PlanAttributes) => (event: any) => {
    setAttributes((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCreateBenefitClass = () => {
    // Add logic to create benefit class here
  };

  return (
    <Box sx={{ pt: 5, pb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Benefit Class Structure
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom style={{ marginBottom: '16px' }}>
                        Class Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel htmlFor="effective-date">Effective Date</InputLabel>
                            <Input
                              id="effective-date"
                              type="date"
                              required
                              value={attributes.effectiveDate}
                              onChange={handleChange('effectiveDate')}
                              style={{ width: '100%', height: '40px' }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Class Name</InputLabel>
                            <Input
                              type="text"
                              value={attributes.className}
                              onChange={handleChange('className')}
                              inputProps={{ maxLength: 50 }}
                              style={{ width: '100%', height: '40px' }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Number of Classes</InputLabel>
                            <Select
                              value={attributes.numberOfClasses}
                              label="Number of Classes"
                              onChange={handleChange('numberOfClasses')}
                            >
                              <MenuItem value={4}>4</MenuItem>
                              <MenuItem value={5}>5</MenuItem>
                              <MenuItem value={6}>6</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Market & Product
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Market Segment</InputLabel>
                            <Select
                              value={attributes.marketSegment}
                              label="Market Segment"
                              onChange={handleChange('marketSegment')}
                            >
                              <MenuItem value="Small">Small Group</MenuItem>
                              <MenuItem value="Individual">Individual</MenuItem>
                              <MenuItem value="Large">Large Group</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Product Type</InputLabel>
                            <Select
                              value={attributes.productType}
                              label="Product Type"
                              onChange={handleChange('productType')}
                            >
                              <MenuItem value="PPO">PPO</MenuItem>
                              <MenuItem value="DHMO">DHMO</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: '40px' }} />
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom style={{ marginBottom: '16px' }}>
                    <strong>Benefit Class Summary</strong>
                  </Typography>
                  <Typography>
                    <strong style={{ color: 'blue' }}>{attributes.className}</strong> has{' '}
                    <strong style={{ color: 'blue' }}>{attributes.numberOfClasses}</strong> classes
                    valid for <strong style={{ color: 'blue' }}>{attributes.marketSegment}</strong>{' '}
                    <strong style={{ color: 'blue' }}>{attributes.productType}</strong> effective on{' '}
                    <strong style={{ color: 'blue' }}>{attributes.effectiveDate}</strong>.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleCreateBenefitClass}>
                      Create Benefit Class Structure
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateBenefitClassForm;
