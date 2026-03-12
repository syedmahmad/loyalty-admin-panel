"use client";

import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material";
import CreateClient from "./CreateClient";
import ClientInfo from "./ClientInfo";
import { useRouter, useSearchParams } from "next/navigation";
import BaseDrawer from "@/components/drawer/basedrawer";

import EditClient from "./EditClient";
import IntegrationsQuery from "./integrations/IntegrationsQuery";

export const ClientsTableData = ({
  clientData,
  reFetchNewClientToken,
}: any) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  const drawerOpen = searchParams.get("drawer");
  const drawerId = searchParams.get("id");
  const selectedClient = clientData.find(
    (tenant: any) => String(tenant.id) === String(drawerId)
  );

  const handleCloseDrawer = () => {
    const currentUrl = window.location.pathname;
    router.push(currentUrl);
  };

  const tenantsContent = (
    <Box>
      <Grid2 container spacing={3}>
          <Grid2 xs={12}>
            <Box
              sx={{
                paddingBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(0, 0, 0, 0.87)",
                  fontFamily: "Outfit",
                  fontSize: "32px",
                  fontWeight: 600,
                }}
                variant="h3"
                color={theme.palette.primary.dark}
                textTransform="capitalize"
              >
                Tenants Details
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  transition: "0.3s",
                  transform: "scale(1)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                  },
                }}
                onClick={() => router.push("/tenants?drawer=create")}
              >
                <b>Create Tenants</b>
              </Button>
            </Box>
          </Grid2>

          {clientData.length === 0 ? (
            <Grid2 xs={12} md={6} mdOffset={3}>
              <Card>
                <CardContent>
                  <CreateClient
                    reFetch={reFetchNewClientToken}
                    openModal={true}
                    setOpenModal={() => {}}
                  />
                </CardContent>
              </Card>
            </Grid2>
          ) : (
            clientData.map((client: any, index: number) => (
              <Grid2 key={client?.clientId || index} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CardContent>
                    <ClientInfo
                      clientInfo={client}
                      reFetch={reFetchNewClientToken}
                    />
                  </CardContent>
                </Card>
              </Grid2>
            ))
          )}
        </Grid2>

      <BaseDrawer
        open={drawerOpen === "create"}
        onClose={handleCloseDrawer}
        title="Create Tenant"
      >
        <CreateClient
          reFetch={() => {
            reFetchNewClientToken();
            handleCloseDrawer();
          }}
          setOpenModal={() => {}}
        />
      </BaseDrawer>
      {drawerOpen === "edit" && drawerId && (
        <BaseDrawer
          open={true}
          onClose={handleCloseDrawer}
          title="Update Tenants info"
        >
          <EditClient
            itemToBeEdited={selectedClient}
            reFetch={() => {
              reFetchNewClientToken();
              handleCloseDrawer();
            }}
            setOpenEditClientInfoModal={handleCloseDrawer}
          />
        </BaseDrawer>
      )}
    </Box>
  );

  return (
    <Box>
      <Container maxWidth="lg">
        {/* Tab header */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            aria-label="tenants and integrations tabs"
          >
            <Tab label="Tenants" id="tab-tenants" aria-controls="tabpanel-tenants" />
            <Tab label="Partners" id="tab-partners" aria-controls="tabpanel-partners" />
          </Tabs>
        </Box>

        {/* Tab panels */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id="tabpanel-tenants"
          aria-labelledby="tab-tenants"
        >
          {activeTab === 0 && tenantsContent}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id="tabpanel-partners"
          aria-labelledby="tab-partners"
        >
          {activeTab === 1 && <IntegrationsQuery />}
        </Box>
      </Container>
    </Box>
  );
};
