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
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ToothIcon from '../common/ToothIcon';
import { MENU_ITEMS } from '../../constants/menuItems';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuSelect: (menuItem: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuSelect }) => {
  const { isAuthenticated, currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [createMenuAnchorEl, setCreateMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [findMenuAnchorEl, setFindMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleCreateMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setCreateMenuAnchorEl(event.currentTarget);
  };

  const handleFindMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setFindMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchorEl(null);
  };

  const handleFindMenuClose = () => {
    setFindMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const handleMenuItemClick = (menuItem: string) => {
    onMenuSelect(menuItem);
    handleCreateMenuClose();
    handleFindMenuClose();
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <ToothIcon sx={{ mr: 1, fontSize: 28, color: 'white' }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Dental Plan Configuration
          </Typography>

          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 4 }}>
              <Button
                color="inherit"
                startIcon={<AddIcon />}
                onClick={handleCreateMenuClick}
                sx={{ mr: 1 }}
              >
                Create
              </Button>
              <Menu
                anchorEl={createMenuAnchorEl}
                open={Boolean(createMenuAnchorEl)}
                onClose={handleCreateMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: { mt: 1.5 },
                }}
              >
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.CREATE_BENEFIT_CLASS)}>
                  Benefit Class Structure
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.CREATE_LIMITS)}>
                  Limits
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.CREATE_PLAN)}>
                  Plans
                </MenuItem>
              </Menu>

              <Button
                color="inherit"
                startIcon={<SearchIcon />}
                onClick={handleFindMenuClick}
                sx={{ mr: 1 }}
              >
                Find
              </Button>
              <Menu
                anchorEl={findMenuAnchorEl}
                open={Boolean(findMenuAnchorEl)}
                onClose={handleFindMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: { mt: 1.5 },
                }}
              >
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.FIND_BENEFIT_CLASS)}>
                  Benefit Class
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.FIND_LIMITS)}>
                  Limits
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(MENU_ITEMS.FIND_PLAN)}>Plans</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

        {isAuthenticated && (
          <>
            <Typography variant="body2" sx={{ color: 'white', mr: 2 }}>
              {currentUser?.fullName} | {userRole?.name}
            </Typography>
            <Tooltip title="Account settings">
              <IconButton onClick={handleUserMenuClick} size="small" sx={{ ml: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}
                >
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
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem>
                <Avatar
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                  }}
                >
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
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
