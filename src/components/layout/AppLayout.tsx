import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';

const AppLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dental Plan Config
          </Typography>
          <Button color="inherit" component={RouterLink} to="/create/class-structure">
            Create
          </Button>
          <Button color="inherit" component={RouterLink} to="/">
            View Plans
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AppLayout;
