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
} from "@mui/material";
import CreateClient from "./CreateClient";
import ClientInfo from "./ClientInfo";
import CreateClientModal from "./CreateClientModal";

export const ClientsTableData = ({
  clientData,
  reFetchNewClientToken,
}: any) => {
  console.log("/clientData", clientData);
  
  const [openModal, setOpenModal] = useState<boolean>(false);
  const theme = useTheme();

  // const user = JSON.parse(
  //   localStorage.getItem("user") || "{}"
  // )
  // const ALLOWED_EMAILS = [
  //   'muzaffar.uzaman@petromin.com',
  //   'amit.joshi@petromin.com',
  //   'syed.muhammed@petromin.com',
  // ];

  // const isAllowed = ALLOWED_EMAILS.includes(user?.email?.toLowerCase() || '');

  if (clientData.length === 0) {
    return (
      <>
        <Container maxWidth="md">
          <Grid2 xs={12} md={6} mdOffset={3} marginTop="20px">
            <Card>
              <CardContent>
                <CreateClient
                  reFetch={reFetchNewClientToken}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                />
              </CardContent>
            </Card>
          </Grid2>
        </Container>
      </>
    );
  }

  return (
    <Box>
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          {/* Header Section */}
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
                variant="h3"
                color={theme.palette.primary.dark}
                textTransform="capitalize"
              >
                Tenants Details
              </Typography>
              <Button
                variant="contained"
                sx={{
                  transition: "0.3s",
                  transform: "scale(1)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                  },
                }}
                onClick={() => setOpenModal(true)}
              >
                <b>Create Tenants</b>
              </Button>
            </Box>
          </Grid2>

          {/* Create Client Section */}
          {clientData.map((client: any, index: any) => (
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
          ))}

          {/* Modal Section */}
          {openModal && (
            <Grid2>
              <CreateClientModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                reFetch={reFetchNewClientToken}
              />
            </Grid2>
          )}
        </Grid2>
      </Container>
    </Box>
  );
};
