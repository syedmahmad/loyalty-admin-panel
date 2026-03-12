"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TenantIntegrationsQuery from "./_components/TenantIntegrationsQuery";
import { Box, Container } from "@mui/material";

const queryClient = new QueryClient();

const IntegrationsPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ py: 3, px: { xs: 2, md: 4 } }}>
        <TenantIntegrationsQuery />
      </Box>
    </QueryClientProvider>
  );
};

export default IntegrationsPage;
