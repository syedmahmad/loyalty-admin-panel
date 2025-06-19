import { ReactNode } from 'react';

// material-ui
import { Box, Grid, Link } from '@mui/material';
import Image from "next/image";

// project import
// import logo3 from '@/assets/images/logo3.png';
import logo3 from '../../../../assets/images/gogo-motor-logo.svg';
import AuthCard from './AuthCard';

// assets
import AuthBackground from '@/assets/images/auth/AuthBackground';

interface Props {
  children: ReactNode;
}

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({ children }: Props) => (
  <Box sx={{ minHeight: '100vh' }}>
    <AuthBackground />
    <Grid
      container
      direction="column"
      justifyContent="flex-end"
    >
      <Grid item xs={12} sx={{ ml: 3, mt: 3 }}>
        <Link href="/">
          <Image
            src={logo3}
            alt="logo"
            width={150}
            height={35}
          />
        </Link>
      </Grid>
      <Grid item xs={12}>
        <Grid
          item
          xs={12}
          container
          justifyContent="center"
          alignItems={{ xs: "center" }}
          sx={{ minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(30vh)', md: 'calc(30vh)' } }}
        >
          <Grid item>
            <AuthCard>{children}</AuthCard>
          </Grid>
        </Grid>
      </Grid>
      {/* <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
      </Grid> */}
    </Grid>
  </Box>
);

export default AuthWrapper;
