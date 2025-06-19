import React from "react";
import { Box, Card, CardContent, Container, Divider, Skeleton } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";

const ClientsLoader = () => {
    return (
        <Grid2 container>
        <Grid2 xs={12}>
          <Card sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <Skeleton variant="rounded" sx={{ marginLeft: '36px', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
            <Grid2 container spacing={2}>
              <Grid2 xs={3}>
                <Skeleton variant="circular" sx={{ marginRight: '36px', marginTop: '12px', marginBottom: '12px' }} width="100%" height={36} />
              </Grid2>
              <Grid2 xs={9}>
                <Skeleton variant="rounded" sx={{ marginRight: '36px', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
              </Grid2>
            </Grid2>
          </Card>
        </Grid2>
        <Grid2 xs={12} marginTop={2}>
          <Container maxWidth="lg">
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <Skeleton variant="rounded" sx={{ marginTop: '12px', marginBottom: '12px' }} width={210} height={44} />
              </Grid2>
              <Grid2 xs={4}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={4}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={4}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            </Grid2>
            <br />
            <Divider sx={{ borderColor: "primary.main", borderBottomWidth: 2 }} />
            <br />
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <Skeleton variant="rounded" sx={{ marginTop: '12px', marginBottom: '12px' }} width={210} height={44} />
              </Grid2>
              <Grid2 xs={4}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={4}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 xs={4}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={110} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={210} height={34} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                      <Skeleton variant="rounded" sx={{ margin: '0 auto', marginTop: '12px', marginBottom: '12px' }} width={80} height={34} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            </Grid2>
          </Container>
        </Grid2>
      </Grid2>
    )
}

export default ClientsLoader;