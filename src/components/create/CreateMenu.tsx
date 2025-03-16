import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';

const CreateMenu: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="dental plan creation tabs">
          <Tab
            label="Class Structure"
            component={Link}
            to="class-structure"
            sx={{ textTransform: 'none' }}
          />
          <Tab label="Limits" component={Link} to="limits" sx={{ textTransform: 'none' }} />
          <Tab label="Plans" component={Link} to="plans" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default CreateMenu;
