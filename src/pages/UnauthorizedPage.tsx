import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <BlockIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography component="h1" variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            You don't have permission to access this page.
          </Typography>
          {userRole && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Your current role ({userRole.name}) doesn't have the required permissions.
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
