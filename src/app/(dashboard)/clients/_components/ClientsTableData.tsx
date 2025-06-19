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
  Drawer,
  Divider,
  Tooltip,
} from "@mui/material";
import CreateClient from "./CreateClient";
import ClientInfo from "./ClientInfo";
import CreateClientModal from "./CreateClientModal";
import EmailSearch from "./globalSearch/EmailSearch";
import SmsSearch from "./globalSearch/SmsSearch";
import { InfoCircleOutlined } from "@ant-design/icons";
import WhatsAppSearch from "./globalSearch/WhatsAppSearch";

export const ClientsTableData = ({
  clientData,
  reFetchNewClientToken,
  openEmailSearch,
  handleCloseEmailSearch,
  openSmsSearch,
  handleCloseSmsSearch,
  smsAverageTime,
  emailAverageTime,
  openWhatsAppSearch,
  handleCloseWhatsAppSearch,
  whatsappAverageTime,
  setOpenEmailSearch,
  setOpenSmsSearch,
  setOpenWhatsAppSearch
}: any) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const theme = useTheme();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  )
  const ALLOWED_EMAILS = [
    'muzaffar.uzaman@petromin.com',
    'amit.joshi@petromin.com',
    'syed.muhammed@petromin.com',
  ];

  const isAllowed = ALLOWED_EMAILS.includes(user?.email?.toLowerCase() || '');

  if (clientData.length === 0) {
    return (
      <>
        <Drawer
          variant="temporary"
          anchor="right"
          open={openEmailSearch}
          onClose={handleCloseEmailSearch}
        >
          <EmailSearch handleCloseEmailSearch={handleCloseEmailSearch} />
        </Drawer>
        <Drawer
          variant="temporary"
          anchor="right"
          open={openSmsSearch}
          onClose={handleCloseSmsSearch}
        >
          <SmsSearch handleCloseSmsSearch={handleCloseSmsSearch} />
        </Drawer>

        <Drawer
          variant="temporary"
          anchor="right"
          open={openWhatsAppSearch}
          onClose={handleCloseWhatsAppSearch}
        >
          <WhatsAppSearch
            handleCloseWhatsAppSearch={handleCloseWhatsAppSearch}
          />
        </Drawer>

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
      <Drawer
        variant="temporary"
        anchor="right"
        open={openEmailSearch}
        onClose={handleCloseEmailSearch}
      >
        <EmailSearch handleCloseEmailSearch={handleCloseEmailSearch} />
      </Drawer>
      <Drawer
        variant="temporary"
        anchor="right"
        open={openSmsSearch}
        onClose={handleCloseSmsSearch}
      >
        <SmsSearch handleCloseSmsSearch={handleCloseSmsSearch} />
      </Drawer>

      <Drawer
        variant="temporary"
        anchor="right"
        open={openWhatsAppSearch}
        onClose={handleCloseWhatsAppSearch}
      >
        <WhatsAppSearch handleCloseWhatsAppSearch={handleCloseWhatsAppSearch} />
      </Drawer>

      <Container maxWidth="lg">
        {isAllowed && (<><Box
          sx={{
            paddingBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h3"
            color={theme.palette.primary.dark}
            textTransform="capitalize"
          >
            Average Time Details
          </Typography>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Tooltip
            title={
              <>
                <strong>Internal processing</strong> is the time take by our
                internal system to process the SMS or Email.
                <br />
                <strong>External processing</strong> is the time taken by the
                external system api's to send the SMS or Email.
              </>
            }
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  whiteSpace: "pre-line",
                },
              },
            }}
          >
            <InfoCircleOutlined
              style={{ cursor: "pointer", fontSize: "1.15rem" }}
            />
          </Tooltip>
        </Box>
        <Grid2 container spacing={2}>
          <Grid2 xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h3"
                  align="center"
                  color={theme.palette.primary.dark}
                >
                  SMS Stats
                </Typography>
                <br />
                <Grid2 container spacing={2}>
                  <Grid2 xs={12}>
                    <Typography
                      sx={{ fontSize: "13px" }}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Internal Processing Time:{" "}
                      {(smsAverageTime?.averageInternalTime / 1000).toFixed(1)}{" "}
                      sec
                    </Typography>
                  </Grid2>
                  <Grid2 xs={12}>
                    <Typography
                      sx={{ fontSize: "13px" }}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      External Processing Time:{" "}
                      {(smsAverageTime?.averageExternalTime / 1000).toFixed(1)}{" "}
                      sec
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenSmsSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Total:{" "}
                      {(smsAverageTime?.totalRecords)}{" "}
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenSmsSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Success:{" "}
                      {(smsAverageTime?.successRecords)}{" "}
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenSmsSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Failed:{" "}
                      {(smsAverageTime?.failedRecords)}{" "}
                    </Typography>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h3"
                  align="center"
                  color={theme.palette.primary.dark}
                >
                  Email Stats
                </Typography>
                <br />
                <Grid2 container spacing={2}>
                  <Grid2 xs={12}>
                    <Typography
                      sx={{ fontSize: "13px" }}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Internal Processing Time:{" "}
                      {(emailAverageTime?.averageInternalTime / 1000).toFixed(
                        1
                      )}{" "}
                      sec
                    </Typography>
                  </Grid2>
                  <Grid2 xs={12}>
                    <Typography
                      sx={{ fontSize: "13px" }}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      External Processing Time:{" "}
                      {(emailAverageTime?.averageExternalTime / 1000).toFixed(
                        1
                      )}{" "}
                      sec
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenEmailSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Total:{" "}
                      {(emailAverageTime?.totalRecords)}{" "}
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenEmailSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Success:{" "}
                      {(emailAverageTime?.successRecords)}{" "}
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenEmailSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Failed:{" "}
                      {(emailAverageTime?.failedRecords)}{" "}
                    </Typography>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h3"
                  align="center"
                  color={theme.palette.primary.dark}
                >
                  WhatsApp Stats
                </Typography>
                <br />
                <Grid2 container spacing={2}>
                  <Grid2 xs={12}>
                    <Typography
                      sx={{ fontSize: "13px" }}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Internal Processing Time:{" "}
                      {(
                        whatsappAverageTime?.averageInternalTime / 1000
                      ).toFixed(1)}{" "}
                      sec
                    </Typography>
                  </Grid2>
                  <Grid2 xs={12}>
                    <Typography
                      sx={{ fontSize: "13px" }}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      External Processing Time:{" "}
                      {(
                        whatsappAverageTime?.averageExternalTime / 1000
                      ).toFixed(1)}{" "}
                      sec
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenWhatsAppSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Total:{" "}
                      {(whatsappAverageTime?.totalRecords)}{" "}
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenWhatsAppSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Success:{" "}
                      {(whatsappAverageTime?.successRecords)}{" "}
                    </Typography>
                  </Grid2>
                  <Grid2 xs={4}>
                    <Typography
                      sx={{ fontSize: "13px", cursor: 'pointer' }}
                      onClick={() => setOpenWhatsAppSearch(true)}
                      color={theme.palette.primary.main}
                      align="center"
                    >
                      Failed:{" "}
                      {(whatsappAverageTime?.failedRecords)}{" "}
                    </Typography>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
        <br />
        <Divider sx={{ borderColor: "primary.main", borderBottomWidth: 2 }} />
        <br /></>)}
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
                Clients Details
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
                <b>Create Clients</b>
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
