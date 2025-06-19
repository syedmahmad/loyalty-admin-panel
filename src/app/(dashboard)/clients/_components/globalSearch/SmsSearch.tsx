import { Box, Typography } from "@mui/material";
import React from "react";
import SMSTableQuery from "./SmsDashboardTableQuery";
import CloseIcon from "@mui/icons-material/Close";

const SmsSearch = ({handleCloseSmsSearch}: any) => {
  return (
    <Box sx={{ width: { xs: "calc(100vw - 60px)", md:"900px" }, padding: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
      <Typography variant="h4" color="primary" fontWeight={600} mb={2}>
        SMS Search
      </Typography>
      <Box onClick={() => handleCloseSmsSearch()} sx={{ cursor: "pointer" }}>
        <CloseIcon />
      </Box>
      </Box>
      <SMSTableQuery />
    </Box>
  );
}

export default SmsSearch;