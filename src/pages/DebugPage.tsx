import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';
import FetchSavedStructures from '../components/benefit-classes/debug/FetchSavedStructures';
import FetchSavedLimits from '../components/limits/debug/FetchSavedLimits';

const DebugPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debug Page
        </Typography>
        <FetchSavedStructures />
        <Divider sx={{ my: 4 }} />
        <FetchSavedLimits />
      </Box>
    </Container>
  );
};

export default DebugPage;
