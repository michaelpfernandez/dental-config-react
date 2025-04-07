import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import FetchSavedStructures from '../components/benefit-classes/debug/FetchSavedStructures';

const DebugPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debug Page
        </Typography>
        <FetchSavedStructures />
      </Box>
    </Container>
  );
};

export default DebugPage;
