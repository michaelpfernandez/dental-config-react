import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const ToothIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12,2C9.47,2 7.12,3.5 6,6C4.88,8.5 5,11.6 5,14C5,16.4 5.53,19.67 7,20.5C8.47,21.33 10.53,20 12,20C13.47,20 15.53,21.33 17,20.5C18.47,19.67 19,16.4 19,14C19,11.6 19.12,8.5 18,6C16.88,3.5 14.53,2 12,2M12,4C13.53,4 15.12,5 16,7C16.88,9 16.93,11.5 16.93,14C16.93,16.5 16.47,18.67 15.5,19.1C14.53,19.53 13.47,18 12,18C10.53,18 9.47,19.53 8.5,19.1C7.53,18.67 7.07,16.5 7.07,14C7.07,11.5 7.12,9 8,7C8.88,5 10.47,4 12,4Z" />
    </SvgIcon>
  );
};

export default ToothIcon;
