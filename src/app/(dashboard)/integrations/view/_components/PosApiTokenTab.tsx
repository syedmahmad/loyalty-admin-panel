"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyIcon from "@mui/icons-material/Key";
import { toast } from "react-toastify";
import { tenantIntegrationService } from "@/services/tenantIntegrationService";

interface ApiEndpoint {
  method: "POST" | "PUT" | "GET";
  path: string;
  description: string;
  body?: Record<string, string | number>;
  note?: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/qitaf/redemption/otp",
    description: "Request OTP — sends a 4-digit PIN via SMS to the customer",
    body: { Msisdn: 500000000, BranchId: "xxxx", TerminalId: "xxxx" },
  },
  {
    method: "POST",
    path: "/qitaf/redemption/redeem",
    description: "Redeem (burn points) — deduct points after PIN verification",
    body: { Msisdn: 500000000, BranchId: "xxxx", TerminalId: "xxxx", PIN: 1234, Amount: 100 },
    note: "Save globalId and requestDate from response for reverse",
  },
  {
    method: "PUT",
    path: "/qitaf/redemption/reverse",
    description: "Manual reverse — cancel a successful redemption",
    body: {
      Msisdn: 500000000,
      BranchId: "xxxx",
      TerminalId: "xxxx",
      RefRequestId: "<globalId from redeem>",
      RefRequestDate: "<requestDate from redeem>",
    },
  },
  {
    method: "POST",
    path: "/qitaf/earn/reward",
    description: "Earn reward — award points after a purchase",
    body: { Msisdn: 500000000, BranchId: "xxxx", TerminalId: "xxxx", Amount: 500 },
    note: "Save globalId and requestDate from response for update/status",
  },
  {
    method: "POST",
    path: "/qitaf/earn/reward-incentive",
    description: "Earn reward + cashier incentive — same as earn but records CashierId",
    body: { Msisdn: 500000000, BranchId: "xxxx", TerminalId: "xxxx", Amount: 500, CashierId: "C001" },
  },
  {
    method: "PUT",
    path: "/qitaf/earn/update",
    description: "Update reward — reduce points for a partial/full refund",
    body: {
      Msisdn: 500000000,
      BranchId: "xxxx",
      TerminalId: "xxxx",
      RefRequestId: "<globalId from earn>",
      RefRequestDate: "<requestDate from earn>",
      ReductionAmount: 100,
    },
  },
  {
    method: "POST",
    path: "/qitaf/earn/reward/status",
    description: "Reward status — check if points were posted (801=Pending, 802=Posted, 803=Rejected, 804=Cancelled)",
    body: {
      Msisdn: 500000000,
      RefRequestId: "<globalId>",
      RefRequestDate: "<requestDate>",
    },
  },
];

const METHOD_COLOR: Record<string, "success" | "warning" | "info"> = {
  POST: "success",
  PUT: "warning",
  GET: "info",
};

interface Props {
  tenantId: number;
  partnerId: number;
  initialToken: string | null | undefined;
  onTokenGenerated: (token: string) => void;
}

const PosApiTokenTab = ({ tenantId, partnerId, initialToken, onTokenGenerated }: Props) => {
  const [token, setToken] = useState<string | null>(initialToken ?? null);
  const [revealed, setRevealed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { token: newToken } = await tenantIntegrationService.generateToken(tenantId, partnerId);
      setToken(newToken);
      setRevealed(true);
      onTokenGenerated(newToken);
      toast.success("POS API token generated successfully");
    } catch {
      toast.error("Failed to generate token");
    } finally {
      setGenerating(false);
      setConfirmOpen(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success("Token copied to clipboard");
    }
  };

  return (
    <Box>
      {/* ── Token Section ───────────────────────────────────────────────── */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <KeyIcon fontSize="small" color="action" />
          <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
            POS API Token
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" color="text.secondary" mb={2}>
          This token is used by POS systems to authenticate all Qitaf API calls.
          Add it as <code>Authorization: Bearer &lt;token&gt;</code> on every request.
          Tokens have no expiry — regenerate if compromised.
        </Typography>

        {token ? (
          <Grid2 container spacing={2}>
            <Grid2 xs={12}>
              <TextField
                fullWidth
                label="Bearer Token"
                value={token}
                type={revealed ? "text" : "password"}
                inputProps={{ dir: "ltr", style: { fontFamily: "monospace", fontSize: 12 } }}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={revealed ? "Hide" : "Show"}>
                        <IconButton size="small" onClick={() => setRevealed((v) => !v)}>
                          {revealed ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy token">
                        <IconButton size="small" onClick={copyToken}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid2>
            <Grid2 xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => setConfirmOpen(true)}
                  disabled={generating}
                >
                  Regenerate Token
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={3}>
            <Typography variant="body2" color="text.secondary">
              No token generated yet. Click below to create one.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating…" : "Generate Token"}
            </Button>
          </Box>
        )}
      </Box>

      {/* ── API Documentation ────────────────────────────────────────────── */}
      <Box>
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
              API Endpoints Reference
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box px={2} py={1}>
              <Typography variant="caption" color="text.secondary">
                All endpoints require: <code>Authorization: Bearer &lt;token&gt;</code>
              </Typography>
            </Box>
            <Divider />
            {API_ENDPOINTS.map((ep, i) => (
              <Box key={ep.path}>
                {i > 0 && <Divider />}
                <Box px={2} py={1.5}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Chip label={ep.method} color={METHOD_COLOR[ep.method]} size="small" sx={{ fontWeight: 700, fontFamily: "monospace", minWidth: 48 }} />
                    <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                      {ep.path}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {ep.description}
                  </Typography>
                  {ep.body && (
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 1,
                        bgcolor: "action.hover",
                        borderRadius: 1,
                        fontSize: 11,
                        fontFamily: "monospace",
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}
                    >
                      {JSON.stringify(ep.body, null, 2)}
                    </Box>
                  )}
                  {ep.note && (
                    <Typography variant="caption" color="warning.main" display="block" mt={0.5}>
                      ↳ {ep.note}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* ── Regenerate Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Regenerate POS API Token?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will invalidate the current token immediately. Any POS system using the old token
            will stop working until it is updated with the new one. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} color="warning" variant="contained" disabled={generating}>
            {generating ? "Regenerating…" : "Yes, Regenerate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PosApiTokenTab;
