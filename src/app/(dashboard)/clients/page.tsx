"use client";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ClientsTableQuery from "@/app/(dashboard)/clients/_components/ClientsTableQuery";
import { alpha, Box, Card, Typography, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const queryClient = new QueryClient();

const ClientPage = () => {
  const theme = useTheme();
  const [openEmailSearch, setOpenEmailSearch] = useState(false);
  const [openSmsSearch, setOpenSmsSearch] = useState(false);
  const [openWhatsAppSearch, setOpenWhatsAppSearch] = useState(false);


  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  )
  const ALLOWED_EMAILS = [
    'muzaffar.uzaman@petromin.com',
    'amit.joshi@petromin.com',
    'syed.muhammed@petromin.com',
  ];

  const isAllowed = ALLOWED_EMAILS.includes(user?.email?.toLowerCase() || '');

  const handleOpenEmailSearch = () => {
    setOpenEmailSearch(true);
  };

  const handleCloseEmailSearch = () => {
    setOpenEmailSearch(false);
  };

  const handleOpenSmsSearch = () => {
    setOpenSmsSearch(true);
  };

  const handleCloseSmsSearch = () => {
    setOpenSmsSearch(false);
  };

  const handleOpenWhatsAppSearch = () => {
    setOpenWhatsAppSearch(true);
  };

  const handleCloseWhatsAppSearch = () => {
    setOpenWhatsAppSearch(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {isAllowed  && (<><Card
        sx={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          top: "calc(0% + 75px)",
          right: 0,
          // background: alpha(theme.palette.primary.main, 0.1),
          zIndex: 9,
          height: "60px",
          width: "60px",
          borderTopLeftRadius: "4px",
          borderBottomLeftRadius: "4px",
        }}
        onClick={() => handleOpenEmailSearch()}
      >
        <EmailIcon color="primary" fontSize="medium" />
        {/* <Typography
          variant="body1"
          color={theme.palette.primary.dark}
          textTransform="capitalize"
          fontWeight={600}
        >
          Email
        </Typography> */}
      </Card>
      <Card
        sx={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          top: "0%",
          right: 0,
          // background: alpha(theme.palette.primary.main, 0.1),
          zIndex: 9,
          height: "60px",
          width: "60px",
          borderTopLeftRadius: "4px",
          borderBottomLeftRadius: "4px",
        }}
        onClick={() => handleOpenSmsSearch()}
      >
        <SmsIcon color="primary" fontSize="medium" />
      </Card>

      <Card
        sx={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          top: "calc(0% + 150px)",
          right: 0,
          // background: alpha(theme.palette.primary.main, 0.1),
          zIndex: 9,
          height: "60px",
          width: "60px",
          borderTopLeftRadius: "4px",
          borderBottomLeftRadius: "4px",
        }}
        onClick={handleOpenWhatsAppSearch}
      >
        <WhatsAppIcon color="primary" fontSize="medium" />
        {/* <Typography
          variant="body1"
          color={theme.palette.primary.dark}
          textTransform="capitalize"
          fontWeight={600}
        >
          WhatsApp
        </Typography> */}
      </Card></>)}
      <ClientsTableQuery
        openEmailSearch={openEmailSearch}
        setOpenEmailSearch={setOpenEmailSearch}
        openSmsSearch={openSmsSearch}
        setOpenSmsSearch={setOpenSmsSearch}
        handleCloseSmsSearch={handleCloseSmsSearch}
        handleCloseEmailSearch={handleCloseEmailSearch}
        openWhatsAppSearch={openWhatsAppSearch}
        handleCloseWhatsAppSearch={handleCloseWhatsAppSearch}
        setOpenWhatsAppSearch={setOpenWhatsAppSearch}
      />
    </QueryClientProvider>
  );
};

export default ClientPage;
