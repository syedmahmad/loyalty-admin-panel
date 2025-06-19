import { Box, Typography } from "@mui/material";
import React from "react";
import EmailHistoryTableQuery from "./EmailHistoryTableQuery";
import CloseIcon from "@mui/icons-material/Close";

const EmailSearch = ({handleCloseEmailSearch}: any) => {
  return (
    <Box sx={{ width: { xs: "calc(100vw - 60px)", md:"800px" }, padding: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
      <Typography variant="h4" color="primary" fontWeight={600} mb={2}>
        Email Search
      </Typography>
      <Box onClick={() => handleCloseEmailSearch()} sx={{ cursor: "pointer" }}>
        <CloseIcon />
      </Box>
      </Box>
      <EmailHistoryTableQuery />
    </Box>
  );
}

export default EmailSearch;