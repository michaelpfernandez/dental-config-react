import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';
import ActionBar from './ActionBar';
import Footer from './Footer';
import { ActionBarProvider } from '../../context/ActionBarContext';
import { MENU_ITEMS } from '../../constants/menuItems';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <ActionBarProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          onMenuSelect={(menuItem) => {
            switch (menuItem) {
              case MENU_ITEMS.CREATE_BENEFIT_CLASS:
                navigate('/benefit-classes/create');
                break;
              case MENU_ITEMS.CREATE_LIMITS:
                navigate('/limits/create');
                break;
              case MENU_ITEMS.CREATE_PLAN:
                navigate('/plans/create');
                break;
              case MENU_ITEMS.FIND_BENEFIT_CLASS:
                navigate('/benefit-classes');
                break;
              case MENU_ITEMS.FIND_LIMITS:
                navigate('/limits');
                break;
              case MENU_ITEMS.FIND_PLAN:
                navigate('/plans');
                break;
              default:
                break;
            }
          }}
        />
        <ActionBar />
        <Container component="main" sx={{ flex: 1 }}>
          {children || <Outlet />}
        </Container>
        <Footer />
      </Box>
    </ActionBarProvider>
  );
};

export default AppLayout;
