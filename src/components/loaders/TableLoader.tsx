import { Card, Skeleton, Stack } from "@mui/material";
import React from "react";

const TableLoader = () => {
  return (
    <Card>
      <Stack spacing={1} sx={{ width: '100%', padding: '24px' }}>
        <Skeleton width="100%" height={30} variant="rectangular" />
        <br />
        <Skeleton width="100%" height={250} variant="rectangular" />
        <br />
        <Skeleton width="100%" height={30} variant="rectangular" />
      </Stack>
    </Card>
  )
}

export default TableLoader;
