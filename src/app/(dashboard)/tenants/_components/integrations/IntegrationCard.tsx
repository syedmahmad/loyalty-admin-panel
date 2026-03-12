"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useTheme,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import { DeleteIntegrationModal } from "./DeleteIntegrationModal";
import type { GlobalIntegration } from "@/types/integration.types";

interface Props {
  integration: GlobalIntegration;
  reFetch: () => void;
  onEdit: (item: GlobalIntegration) => void;
}

const IntegrationCard = ({ integration, reFetch, onEdit }: Props) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDelete, setShowDelete] = useState(false);
  const menuOpen = Boolean(anchorEl);

  return (
    <>
      <Grid2 container sx={{ position: "relative", minWidth: 240 }}>
        {/* Menu */}
        <Box sx={{ position: "absolute", top: 0, right: 0 }}>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: { boxShadow: "none", border: "1px solid #e0e0e0", mt: 1 },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onEdit(integration);
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setShowDelete(true);
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>

        {/* Icon + Name */}
        <Grid2 xs={12} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <IntegrationInstructionsIcon
            sx={{ color: theme.palette.primary.main, fontSize: 28 }}
          />
          <Typography
            variant="h3"
            color={theme.palette.primary.dark}
            textTransform="capitalize"
            sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {integration.name}
          </Typography>
        </Grid2>

        {/* Status badge */}
        {!integration.isActive && (
          <Grid2 xs={12} sx={{ mb: 1 }}>
            <Chip label="Inactive" size="small" color="default" />
          </Grid2>
        )}

        {/* Description */}
        {integration.description && (
          <Grid2 xs={12}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {integration.description}
            </Typography>
          </Grid2>
        )}
      </Grid2>

      {showDelete && (
        <DeleteIntegrationModal
          item={integration}
          open={showDelete}
          onClose={() => setShowDelete(false)}
          reFetch={reFetch}
        />
      )}
    </>
  );
};

export default IntegrationCard;
