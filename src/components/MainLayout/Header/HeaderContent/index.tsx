import React from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';

import Profile from './Profile';

import useConfig from '../../../../hooks/useConfig';
import DrawerHeader from '../../Drawer/DrawerHeader';

// types
import { MenuOrientation } from '../../../../types/config';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%'
      }}
    >
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <Profile />
    </Box>
  );
};

export default HeaderContent;
