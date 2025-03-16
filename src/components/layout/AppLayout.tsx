import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';
import { MENU_ITEMS } from '../../constants/menuItems';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
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
      <Container component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AppLayout;
