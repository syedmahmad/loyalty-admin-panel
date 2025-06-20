import React, { useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Container, Toolbar } from '@mui/material';
import { usePathname } from 'next/navigation';

// project import
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';

import useConfig from '../../hooks/useConfig';
import { dispatch } from '../../store';
import { openDrawer } from '../../store/reducers/menu';


// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  const theme = useTheme();
  // const matchDownXL = useMediaQuery(theme.breakpoints.down('xl'));
  const { container } = useConfig();
  const pathname = usePathname();

  const isDashboardMainRoute = pathname === '/tenants';

  // set media wise responsive drawer
  // useEffect(() => {
  //   if (!localStorage.getItem('token') && pathname !== "/login") {
  //           window.location.pathname = '/login';
  //       } 
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <Box sx={{ display: 'flex', width: '100%',}}>
      <Header />
      {isDashboardMainRoute ? null : <Drawer /> }

      <Box component="main" sx={isDashboardMainRoute ? {width: '100%'} : { width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar sx={{ mt: 'inherit' }} />
        <Container
          maxWidth={container ? 'xl' : false}
          sx={{
            ...(container && { px: { xs: 0, sm: 2 } }),
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
            marginTop:'20px'
          }}
        >
          {children}
          <Footer />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
