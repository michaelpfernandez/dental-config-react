import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import ToothIcon from '../common/ToothIcon';

// Import menu item types and constants
import { MENU_ITEMS } from '../../constants/menuItems';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuSelect: (menuItem: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuSelect }) => {
  const { isAuthenticated, currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(null);
  const [findAnchorEl, setFindAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleCreateClick = (event: React.MouseEvent<HTMLElement>) => {
    setCreateAnchorEl(event.currentTarget);
  };

  const handleFindClick = (event: React.MouseEvent<HTMLElement>) => {
    setFindAnchorEl(event.currentTarget);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleCreateClose = () => {
    setCreateAnchorEl(null);
  };

  const handleFindClose = () => {
    setFindAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleMenuItemClick = (menuItem: string) => {
    onMenuSelect(menuItem);
    handleCreateClose();
    handleFindClose();
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: '1px solid #e0e0e0' }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <ToothIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            Dental Plan Configuration
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={handleCreateClick}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ mr: 2 }}
              >
                Create
              </Button>
              <Menu
                anchorEl={createAnchorEl}
                open={Boolean(createAnchorEl)}
                onClose={handleCreateClose}
              >
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.CREATE_PATIENT)}>
                  Patient
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.CREATE_APPOINTMENT)}>
                  Appointment
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.CREATE_TREATMENT)}>
                  Treatment
                </MenuItem>
              </Menu>

              <Button
                color="inherit"
                onClick={handleFindClick}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ mr: 2 }}
              >
                Find
              </Button>
              <Menu anchorEl={findAnchorEl} open={Boolean(findAnchorEl)} onClose={handleFindClose}>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.FIND_PATIENT)}>
                  Patient
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.FIND_APPOINTMENT)}>
                  Appointment
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.FIND_TREATMENT)}>
                  Treatment
                </MenuItem>
              </Menu>

              <Tooltip title="Account settings">
                <IconButton onClick={handleUserMenuClick} size="small" sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {currentUser?.fullName.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {currentUser?.fullName.charAt(0) || 'U'}
                  </Avatar>
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle2">{currentUser?.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userRole?.name}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="primary" variant="contained" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
