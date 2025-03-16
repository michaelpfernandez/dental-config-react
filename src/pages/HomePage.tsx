import React, { useState } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Header from 'components/layout/Header';
import { MenuItem } from 'constants/menuItems';

const HomePage: React.FC = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const handleMenuSelect = (menuItem: string) => {
    setSelectedMenuItem(menuItem as MenuItem);
    // In the future, this could navigate to different pages or show different components
  };

  // Render different content based on selected menu item
  const renderContent = () => {
    if (!selectedMenuItem) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Dental Plan Configuration
          </Typography>
          <Typography variant="body1">
            Please select an option from the menu above to get started.
          </Typography>
        </Box>
      );
    }

    // Placeholder content for different menu selections
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          {selectedMenuItem
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </Typography>
        <Typography variant="body1">
          This section is under development. You selected: {selectedMenuItem}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Header onMenuSelect={handleMenuSelect} />
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ mt: 4, p: 3, minHeight: '70vh' }}>
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
