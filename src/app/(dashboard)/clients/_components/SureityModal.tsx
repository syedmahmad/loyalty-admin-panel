import React, { Dispatch, SetStateAction } from "react";
import { Box, Button, Dialog, IconButton, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditClient from "./EditClient";
import Grid2 from "@mui/material/Unstable_Grid2";

const RegenrateModal = ({
  isOpen,
  onClose,
  clientId,
  handleRegenerateSecret
}: any) => {
  const theme = useTheme();

  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose()}
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
          maxWidth: "600px",
        },
      }}
    >
      {/* Close button on the top-right */}
      <Box sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={() => onClose()}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid2 container spacing={3}>
      <Grid2 xs={12}>
        <Typography
          variant="h2"
          color={theme.palette.primary.dark}
          textTransform="capitalize"
          align="center"
        >
          {"Alert"}
        </Typography>
      </Grid2>

      <Grid2 xs={12}>
        <Typography
          variant="body1"
          color={theme.palette.primary.dark}
          align="center"
        >
          Are you sure you want to regenerate the secret key for this client?
          <br />
          This action cannot be undone and the old secret key will no longer
          work.
        </Typography>
      </Grid2>

      <Grid2 xs={12} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleRegenerateSecret(clientId)}
        >
          {"Regenrate"}
        </Button>
      </Grid2>
    </Grid2>
      </Box>
    </Dialog>
  );
};

export default RegenrateModal;
