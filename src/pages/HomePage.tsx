import React from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

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
          {isAuthenticated && (
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary">
                Create
              </Button>
              <Button variant="contained" color="secondary" sx={{ ml: 2 }}>
                Find
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;
