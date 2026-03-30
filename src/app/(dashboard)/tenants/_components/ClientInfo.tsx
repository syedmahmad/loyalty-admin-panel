"use client";

import React, { useEffect, useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Typography,
  useTheme,
  Box,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EditClientModal from "./EditClientModal";
import { DeleteClientModal } from "./DeleteClientModal";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRouter } from "next/navigation";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

const ClientInfo = ({ clientInfo, reFetch }: any) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClose = () => setAnchorEl(null);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [openEditClientInfoModal, setOpenEditClientInfoModal] = useState(false);
  const [itemToBeEdited, setItemToBeEdited] = useState<any>(null);

  const handleOpenEditModal = (item: any) => {
    setOpenEditClientInfoModal(true);
    setItemToBeEdited(item);
  };

  const [openDeleteClientModal, setOpenDeleteClientModal] = useState(false);
  const [itemToBeDeleted, setItemToBeDeleted] = useState<any>(null);

  const handleDelete = async (clientInfo: any) => {
    setOpenDeleteClientModal(true);
    setItemToBeDeleted(clientInfo);
  };

  return (
    <Grid2 container>
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                  mt: 1,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                router.push(`/tenants?drawer=edit&id=${clientInfo.id}`);
              }}
            >
              <EditIcon fontSize="small" style={{ marginRight: 8 }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                handleDelete(clientInfo);
              }}
            >
              <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid2 xs={12} sx={{ mb: 1 }}>
        <Tooltip title={clientInfo.name || ""} arrow>
          <Typography
            variant="h3"
            color={theme.palette.primary.dark}
            textTransform="capitalize"
          >
            {clientInfo?.name &&
              (clientInfo.name.length > 15
                ? clientInfo.name.slice(0, 15) + "..."
                : clientInfo.name)}
          </Typography>
        </Tooltip>
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 3 }}>
        <ClientDetails clientInfo={clientInfo} />
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button
            variant="outlined"
            endIcon={<KeyboardArrowRightIcon />}
            onClick={() => {
              localStorage.setItem("client-info", JSON.stringify(clientInfo));
              window.location.pathname = "/business-units/view";
            }}
          >
            Details
          </Button>
        </Box>
      </Grid2>

      {openEditClientInfoModal && (
        <EditClientModal
          itemToBeEdited={itemToBeEdited}
          openEditClientInfoModal={openEditClientInfoModal}
          setOpenEditClientInfoModal={setOpenEditClientInfoModal}
          reFetch={reFetch}
        />
      )}

      {openDeleteClientModal && (
        <DeleteClientModal
          itemToBeDeleted={itemToBeDeleted}
          openDeleteClientModal={openDeleteClientModal}
          setOpenDeleteClientModal={setOpenDeleteClientModal}
          reFetch={reFetch}
        />
      )}
    </Grid2>
  );
};

export default ClientInfo;


const ClientDetails = ({ clientInfo }: any) => {
  const theme = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [tokenVisible, setTokenVisible] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    GET(`/tenants/${clientInfo.id}/api-token`)
      .then((res) => {
        setToken(res?.data?.token ?? null);
      })
      .catch(console.error);
  }, [clientInfo.id]);

  const handleGenerate = async () => {
    setTokenLoading(true);
    setConfirmOpen(false);
    try {
      const res = await POST(`/tenants/${clientInfo.id}/api-token`, {});
      if (res?.status === 200) {
        setToken(res.data.token);
        toast.success("API token regenerated! Share the new token with all vendors.");
      }
    } catch {
      toast.error("Failed to generate token.");
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success("Token copied!");
    }
  };

  const maskedToken = token ? token.slice(0, 8) + "••••••••••••••••••••" : null;

  return (
    <Grid2 container spacing={1}>
      {/* API Token row */}
      <Grid2 xs={12}>
        <Typography
          sx={{ fontSize: "14px", fontWeight: "600", color: theme.palette.primary.dark }}
        >
          <b>API Token:</b>
        </Typography>
      </Grid2>
      <Grid2 xs={12}>
        {token ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "11px",
                fontFamily: "monospace",
                wordBreak: "break-all",
                flex: 1,
              }}
            >
              {tokenVisible ? token : maskedToken}
            </Typography>
            <Tooltip title={tokenVisible ? "Hide" : "Show"}>
              <IconButton size="small" onClick={() => setTokenVisible((v) => !v)}>
                {tokenVisible ? (
                  <VisibilityOffIcon fontSize="inherit" />
                ) : (
                  <VisibilityIcon fontSize="inherit" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Regenerate">
              <IconButton size="small" onClick={() => setConfirmOpen(true)} disabled={tokenLoading}>
                {tokenLoading ? (
                  <CircularProgress size={14} />
                ) : (
                  <RefreshIcon fontSize="inherit" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Button
            size="small"
            variant="outlined"
            onClick={handleGenerate}
            disabled={tokenLoading}
            sx={{ textTransform: "none", fontSize: "12px" }}
          >
            {tokenLoading ? <CircularProgress size={14} /> : "Generate Token"}
          </Button>
        )}
      </Grid2>

      {/* Regenerate confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          Regenerate API Token?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            This token is shared with <strong>all vendors and websites</strong> using the{" "}
            <strong>{clientInfo.name}</strong> loyalty API.
          </DialogContentText>
          <DialogContentText sx={{ color: "error.main", fontWeight: 600 }}>
            If you regenerate, the old token stops working immediately. You must share the new
            token with every vendor, otherwise their API calls will fail.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            color="error"
            disabled={tokenLoading}
            sx={{ textTransform: "none" }}
          >
            {tokenLoading ? <CircularProgress size={18} color="inherit" /> : "Yes, Regenerate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Domain */}
      <Grid2 xs={6}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.palette.primary.dark,
          }}
        >
          <b>Domain:</b>
        </Typography>
      </Grid2>
      <Grid2 xs={6} display="flex" justifyContent="flex-end">
        <Typography>
          <b>{clientInfo.domain}</b>
        </Typography>
      </Grid2>

      {/* Currency */}
      <Grid2 xs={6}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.palette.primary.dark,
          }}
        >
          <b>Currency:</b>
        </Typography>
      </Grid2>
      <Grid2 xs={6} display="flex" justifyContent="flex-end">
        <Typography>
          <b>{clientInfo.currency || "N/A"}</b>
        </Typography>
      </Grid2>
    </Grid2>
  );
};
