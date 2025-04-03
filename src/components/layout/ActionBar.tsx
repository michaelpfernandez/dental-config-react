import React from 'react';
import { Box } from '@mui/material';
import { useActionBar } from '../../context/ActionBarContext';

const ActionBar: React.FC = () => {
  const { actions } = useActionBar();

  // If there are no actions, don't render the bar
  if (actions.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative', // Changed from fixed to relative
        height: '32px',
        backgroundColor: '#e3f2fd', // Light blue background
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 16px',
        zIndex: 1, // Lower z-index so it doesn't overlay content
      }}
    >
      {actions.map((action) => (
        <Box key={action.id} sx={{ ml: 1 }}>
          {action.component}
        </Box>
      ))}
    </Box>
  );
};

export default ActionBar;
