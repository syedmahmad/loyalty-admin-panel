"use client";

import React from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import BaseDrawer from "@/components/drawer/basedrawer";
import IntegrationCard from "./IntegrationCard";
import CreateIntegration from "./CreateIntegration";
import EditIntegration from "./EditIntegration";
import type { GlobalIntegration } from "@/types/integration.types";

interface Props {
  integrations: GlobalIntegration[];
  reFetch: () => void;
}

const IntegrationsTableData = ({ integrations, reFetch }: Props) => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const drawerParam = searchParams.get("intDrawer");
  const drawerIdParam = searchParams.get("intId");

  const selectedIntegration = integrations.find(
    (i) => String(i.id) === String(drawerIdParam)
  );

  const openDrawer = (type: "create" | "edit", id?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("intDrawer", type);
    if (id !== undefined) params.set("intId", String(id));
    else params.delete("intId");
    router.push(`/tenants?${params.toString()}`);
  };

  const handleCloseDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("intDrawer");
    params.delete("intId");
    const qs = params.toString();
    router.push(`/tenants${qs ? `?${qs}` : ""}`);
  };

  return (
    <Box>
      <Container maxWidth="lg" disableGutters>
        <Grid2 container spacing={3}>
          {/* Header */}
          <Grid2 xs={12}>
            <Box
              sx={{
                pb: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(0,0,0,0.87)",
                  fontFamily: "Outfit",
                  fontSize: "32px",
                  fontWeight: 600,
                }}
                variant="h3"
                color={theme.palette.primary.dark}
              >
                Partners
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                  },
                }}
                onClick={() => openDrawer("create")}
              >
                <b>Add Partner</b>
              </Button>
            </Box>
          </Grid2>

          {/* Empty state */}
          {integrations.length === 0 && (
            <Grid2 xs={12}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={6}
                gap={2}
              >
                <Typography color="text.secondary">
                  No partners defined yet. Add your first partner to get started.
                </Typography>
              </Box>
            </Grid2>
          )}

          {/* Cards */}
          {integrations.map((integration) => (
            <Grid2 key={integration.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  width: "100%",
                  opacity: integration.isActive ? 1 : 0.65,
                }}
              >
                <CardContent>
                  <IntegrationCard
                    integration={integration}
                    reFetch={reFetch}
                    onEdit={(item) => openDrawer("edit", item.id)}
                  />
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Container>

      {/* Create Drawer */}
      <BaseDrawer
        open={drawerParam === "create"}
        onClose={handleCloseDrawer}
        title="Add Partner"
      >
        <CreateIntegration
          reFetch={() => {
            reFetch();
            handleCloseDrawer();
          }}
        />
      </BaseDrawer>

      {/* Edit Drawer */}
      {drawerParam === "edit" && selectedIntegration && (
        <BaseDrawer
          open={true}
          onClose={handleCloseDrawer}
          title="Edit Partner"
        >
          <EditIntegration
            item={selectedIntegration}
            reFetch={reFetch}
            onClose={handleCloseDrawer}
          />
        </BaseDrawer>
      )}
    </Box>
  );
};

export default IntegrationsTableData;
