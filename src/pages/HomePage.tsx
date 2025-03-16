import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ mt: 4, p: 3, minHeight: '70vh' }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Dental Plan Configuration
          </Typography>
          <Typography variant="body1">
            Please use the menu above to manage your dental plans.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;
