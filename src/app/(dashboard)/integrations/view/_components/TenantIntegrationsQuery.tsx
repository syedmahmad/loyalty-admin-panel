"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationService } from "@/services/integrationService";
import { tenantIntegrationService } from "@/services/tenantIntegrationService";
import TenantIntegrationCard from "./TenantIntegrationCard";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import type { TenantIntegrationConfig } from "@/types/integration.types";

const TenantIntegrationsQuery = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    data: allIntegrations,
    isLoading: loadingAll,
    isError: errorAll,
  } = useQuery({
    queryKey: ["get-integrations"],
    queryFn: () => integrationService.getAll(),
  });

  const {
    data: tenantConfigs,
    isLoading: loadingConfigs,
    isError: errorConfigs,
  } = useQuery({
    queryKey: ["get-tenant-integrations"],
    queryFn: () => {
      const clientInfo = JSON.parse(localStorage.getItem("client-info") || "{}");
      return tenantIntegrationService.getByTenant(clientInfo?.id);
    },
  });

  const reFetch = () => {
    queryClient.invalidateQueries({ queryKey: ["get-integrations"] });
    queryClient.invalidateQueries({ queryKey: ["get-tenant-integrations"] });
  };

  if (loadingAll || loadingConfigs) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorAll || errorConfigs) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Typography color="error">Failed to load integrations.</Typography>
      </Box>
    );
  }

  const activeIntegrations = (allIntegrations ?? []).filter((i) => i.isActive);

  if (activeIntegrations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Typography color="text.secondary">
          No partners have been added yet. Ask your super admin to add one from the Partners tab on the main page.
        </Typography>
      </Box>
    );
  }

  const configMap = new Map<number, TenantIntegrationConfig>(
    (tenantConfigs ?? []).map((c) => [c.integrationId, c])
  );

  const tenantId = JSON.parse(localStorage.getItem("client-info") || "{}").id;

  return (
    <Container maxWidth="lg" disableGutters>
      <Box mb={4}>
        <Typography
          sx={{
            fontFamily: "Outfit",
            fontSize: "32px",
            fontWeight: 600,
            color: "rgba(0,0,0,0.87)",
          }}
          variant="h3"
          color={theme.palette.primary.dark}
        >
          Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Enable and configure external loyalty programs for this tenant.
          Each configuration is local to this tenant only.
        </Typography>
      </Box>

      <Grid2 container spacing={3}>
        {activeIntegrations.map((integration) => (
          <Grid2 key={integration.id} xs={12} sm={6} md={4}>
            <TenantIntegrationCard
              integration={integration}
              tenantConfig={configMap.get(integration.id) ?? null}
              tenantId={tenantId}
              reFetch={reFetch}
            />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
};

export default TenantIntegrationsQuery;
