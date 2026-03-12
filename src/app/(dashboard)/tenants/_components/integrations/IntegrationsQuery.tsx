"use client";

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationService } from "@/services/integrationService";
import IntegrationsTableData from "./IntegrationsTableData";
import { Box, CircularProgress, Typography } from "@mui/material";

const IntegrationsQuery = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-integrations"],
    queryFn: () => integrationService.getAll(),
  });

  const reFetch = () => {
    queryClient.invalidateQueries({ queryKey: ["get-integrations"] });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Typography color="error">Failed to load integrations.</Typography>
      </Box>
    );
  }

  return (
    <IntegrationsTableData
      integrations={data ?? []}
      reFetch={reFetch}
    />
  );
};

export default IntegrationsQuery;
