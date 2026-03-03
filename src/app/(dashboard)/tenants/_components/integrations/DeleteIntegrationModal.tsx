"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { integrationService } from "@/services/integrationService";
import type { GlobalIntegration } from "@/types/integration.types";

interface Props {
  item: GlobalIntegration;
  open: boolean;
  onClose: () => void;
  reFetch: () => void;
}

export const DeleteIntegrationModal = ({ item, open, onClose, reFetch }: Props) => {
  const handleDelete = async () => {
    try {
      await integrationService.remove(item.id);
      toast.success("Integration deleted successfully");
      reFetch();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete integration");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600}>Remove Partner</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={1}>
          <DeleteOutlineIcon color="error" sx={{ fontSize: 48 }} />
          <Typography align="center">
            Are you sure you want to delete <strong>{item.name}</strong>?
            <br />
            This will also remove all tenant configurations for this partner.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete} fullWidth>
          Yes, Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
