import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { BenefitClass } from '../../types/config';

const ClassStructure: React.FC = () => {
  const [benefitClasses, setBenefitClasses] = React.useState<Record<string, BenefitClass>>();
  const [benefits, setBenefits] = React.useState<any>();

  React.useEffect(() => {
    // Load benefit classes and benefits from our config files
    const loadConfigs = async () => {
      const classesResponse = await fetch('/api/config/benefitClasses');
      const benefitsResponse = await fetch('/api/config/benefits');

      const classes = await classesResponse.json();
      const benefits = await benefitsResponse.json();

      setBenefitClasses(classes);
      setBenefits(benefits);
    };

    loadConfigs();
  }, []);

  if (!benefitClasses || !benefits) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Class Structure
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(benefitClasses).map(([key, benefitClass]) => (
          <Grid item xs={12} md={4} key={key}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {benefitClass.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {benefitClass.description}
                </Typography>
                <Chip
                  label={`${benefitClass.defaultCostShare}% Cost Share`}
                  color={benefitClass.defaultCostShare === 0 ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle2" gutterBottom>
                  Services:
                </Typography>
                <List dense>
                  {benefits[key]?.map((benefit: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText primary={benefit.name} secondary={benefit.code} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClassStructure;
