'use client';
// material-ui
import { Button, Stack, Typography } from '@mui/material';

// assets
import construction from '@/assets/images/maintenance/Error500.png';
import Image from 'next/image';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

// ==============================|| UNDER CONSTRUCTION - MAIN ||============================== //

function NotFound() {
  return (
    <Grid2 container alignItems="center" justifyContent="center" maxWidth="80%" margin="0 auto">
      <Grid2 xs={12} md={6} alignItems="center" justifyContent="center">
        <Image src={construction} alt="error" />
      </Grid2>
      <Grid2 xs={12} md={6} alignItems="center" justifyContent="center">
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography align="center" variant="h1">
            Something Went Wrong
          </Typography>
          <Typography color="textSecondary" align="center" sx={{ width: '85%' }}>
            Hey! Please try to reload the page, something unexpected has happend
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Stack>
      </Grid2>
    </Grid2>
  );
}

export default NotFound;
