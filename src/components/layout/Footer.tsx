import React from 'react';
import { Box, Typography } from '@mui/material';
import { appConfig } from '../../config/appConfig';

/**
 * Application footer component that appears on all pages
 * Currently displays the version number, but can be extended to include
 * additional information like copyright, links, etc.
 */
const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '30px',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Version {appConfig.version}
      </Typography>
    </Box>
  );
};

export default Footer;
