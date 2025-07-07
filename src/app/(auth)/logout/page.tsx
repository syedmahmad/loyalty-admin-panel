'use client';

import AuthWrapper from '@/app/(auth)/login/_components/AuthWrapper';
import AnimateButton from '@/components/@extended/AnimateButton';
import { Button, Grid, Typography, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

const Logout = () => {
    const theme = useTheme();
    // if user redirects to protected routes but middleware identifies the expiry token then user will redirects to 
    // logout route.
    useEffect(() => {
      // document.cookie = `token=; path=/; max-age=0; secure; samesite=strict;`;
      // localStorage.clear();
    }, []);

    return <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{width: '400px'}}>
            {/* <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary" onClick={() => window.location.pathname = '/login'}>
                Login
            </Button> */}
            <Typography align='center' variant='h5' fontWeight={500}>
                You're succeffully logged out from the dashboard.
                <br />
                If you want to log-in again please click =&gt; &nbsp;
                <span style={{ color: theme.palette.primary.main, cursor: 'pointer', fontWeight: '700' }} onClick={() => window.location.pathname = '/login'}>
                    Login
                </span>
            </Typography>
        </Grid>
      </Grid>
    </AuthWrapper>
};

export default Logout;
