"use client";

import React from "react";
import {
  Box,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, Tooltip } from "@mui/material";
import { toast } from "react-toastify";

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
    description: "Manual reverse — cancel a redemption using the exact globalId and requestDate from the original redeem response",
    body: {
      Msisdn: 500000000,
      BranchId: "xxxx",
      TerminalId: "xxxx",
      RefRequestId: "<globalId from redeem response>",
      RefRequestDate: "<requestDate from redeem response>",
    },
    note: "Use reverse-by-msisdn below if you don't have the globalId handy",
  },
  {
    method: "PUT",
    path: "/qitaf/redemption/reverse-by-msisdn",
    description:
      "Cashier-friendly reverse — cancels the customer's last successful redemption without needing a UUID. " +
      "The system looks up our transaction history, finds the most recent successful redeem for this Msisdn, " +
      "and automatically fills in the RefRequestId and RefRequestDate before calling STC. " +
      "The cashier only needs the customer's phone number — nothing else.",
    body: { Msisdn: 500000000, BranchId: "xxxx", TerminalId: "xxxx" },
    note: "Preferred over manual reverse — cashier never has to copy/paste a UUID",
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
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const AuthenticationTab = ({ values, onChange }: Props) => {
  return (
    <Box>
      {/* ── Checkout Behaviour ──────────────────────────────────────────────── */}
      <Box mb={3}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
          Checkout Behaviour
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={!!values.autoEarnOnPartialRedemption}
              onChange={(e) => onChange("autoEarnOnPartialRedemption", e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Auto-earn STC points on remaining payment
              </Typography>
              <Typography variant="caption" color="text.secondary">
                When enabled, if a customer partially pays using Qitaf points and pays the rest via cash or card,
                the system will automatically reward STC Qitaf points for the remaining paid amount.
              </Typography>
            </Box>
          }
          sx={{ alignItems: "flex-start", mb: 1 }}
        />
      </Box>

      {/* ── Authentication Instructions ─────────────────────────────────────── */}
      <Box mb={3}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
          Authentication
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />

        <Alert severity="info" sx={{ mb: 2 }}>
          POS systems authenticate using the <strong>tenant API token</strong> — the same token used
          for all other loyalty API calls. No separate Qitaf token is needed.
        </Alert>

        <Typography variant="body2" color="text.secondary" mb={1}>
          Include the token on every request as a Bearer header:
        </Typography>

        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.5,
            bgcolor: "action.hover",
            borderRadius: 1,
            fontSize: 12,
            fontFamily: "monospace",
            overflowX: "auto",
          }}
        >
          {`Authorization: Bearer <tenant-api-token>`}
        </Box>

        <Typography variant="body2" color="text.secondary" mt={2}>
          The tenant API token can be found in the tenant settings page. Tokens are long-lived
          and have no expiry — rotate from tenant settings if compromised.
        </Typography>
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
                All endpoints require: <code>Authorization: Bearer &lt;tenant-api-token&gt;</code>
              </Typography>
            </Box>
            <Divider />
            {API_ENDPOINTS.map((ep, i) => (
              <Box key={ep.path}>
                {i > 0 && <Divider />}
                <Box px={2} py={1.5}>
                  {/* Method badge + path */}
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Chip
                      label={ep.method}
                      color={METHOD_COLOR[ep.method]}
                      size="small"
                      sx={{ fontWeight: 700, fontFamily: "monospace", minWidth: 48 }}
                    />
                    <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                      {ep.path}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {ep.description}
                  </Typography>

                  {/* Body block with copy button */}
                  {ep.body && (
                    <Box sx={{ position: "relative" }}>
                      <Tooltip title="Copy body">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(ep.body, null, 2));
                            toast.success("Body copied!");
                          }}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            zIndex: 1,
                            bgcolor: "background.paper",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>

                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1,
                          pr: 4,
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
                    </Box>
                  )}

                  {/* Optional note below the body */}
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
    </Box>
  );
};

export default AuthenticationTab;
