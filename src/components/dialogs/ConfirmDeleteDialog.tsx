import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Divider,
  IconButton,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";

export default function ConfirmDeleteDialog({
  open,
  onClose,
  setDeleteId,
  handleDelete,
  message,
}: any) {
  return (
    <Dialog open={open} onClose={onClose}>
      {/* Red border on top */}
      <Box sx={{ height: "4px", backgroundColor: "#f44336" }} />

      {/* Close button in top-right */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
        size="small"
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <WarningAmberIcon sx={{ color: "#f44336", fontSize: 40 }} />
        <Box>
          <Typography variant="h5" gutterBottom>
            Confirm Delete
          </Typography>
          <Typography>{message} This action cannot be undone.</Typography>
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            setDeleteId(null);
            onClose();
          }}
          size="small"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => handleDelete()}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
