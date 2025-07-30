'use client';

import AuthWrapper from '@/app/(auth)/login/_components/AuthWrapper';
import Microsoft from '@/components/Microsoft';
import { Grid, Typography, useTheme } from '@mui/material';
import Image from "next/image";
import logo3 from '../../../assets/images/gogo-motor-logo.svg';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { useLayoutEffect } from 'react';
import LoginPage from '../loginpage/newlogin/page';

const Login = () => {
  const theme = useTheme();
    return<>
    <Grid container spacing={3}>
      <Grid item xs={12}>
          <Typography align='center' variant='h5' fontWeight={500}>
          <Grid item xs={12}>
             
          </Grid>
         
              <LoginPage/>
          </Typography>
      </Grid>
    </Grid>
  </>
};

export default Login;
