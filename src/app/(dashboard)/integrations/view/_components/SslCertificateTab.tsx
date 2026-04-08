"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Divider,
  Tooltip,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import SecurityIcon from "@mui/icons-material/Security";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const EXPIRY_YEARS: Record<string, number> = {
  staging: 3,
  production: 5,
};

const WARN_DAYS = 30;
const CAUTION_DAYS = 90;

export interface SslExpiryInfo {
  daysRemaining: number;
  expiryDate: Date;
  isExpired: boolean;
  isWarning: boolean;
  isCaution: boolean;
}

/**
 * Compute SSL certificate expiry from a generation date string + environment.
 * Returns null if inputs are missing/invalid.
 */
export const computeSslExpiry = (
  generatedAt: string | undefined,
  environment: string | undefined,
): SslExpiryInfo | null => {
  if (!generatedAt || !environment || !EXPIRY_YEARS[environment]) return null;
  const generated = new Date(generatedAt);
  if (isNaN(generated.getTime())) return null;

  const expiry = new Date(generated);
  expiry.setFullYear(expiry.getFullYear() + EXPIRY_YEARS[environment]);

  const today = new Date();
  const daysRemaining = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    daysRemaining,
    expiryDate: expiry,
    isExpired: daysRemaining <= 0,
    isWarning: daysRemaining > 0 && daysRemaining <= WARN_DAYS,
    isCaution: daysRemaining > WARN_DAYS && daysRemaining <= CAUTION_DAYS,
  };
};

interface Props {
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const SslCertificateTab = ({ values, onChange }: Props) => {
  const expiry = computeSslExpiry(values.sslCertGeneratedAt, values.sslEnvironment);

  const chipColor = expiry
    ? expiry.isExpired || expiry.isWarning
      ? "error"
      : expiry.isCaution
        ? "warning"
        : "success"
    : "default";

  const chipLabel = expiry
    ? expiry.isExpired
      ? "EXPIRED"
      : `${expiry.daysRemaining} days remaining`
    : "Not set";

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <SecurityIcon fontSize="small" color="action" />
        <Typography
          fontWeight={700}
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing={0.8}
          sx={{ fontSize: 12 }}
        >
          SSL / mTLS Certificate
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="body2" color="text.secondary" mb={3}>
        STC issues mTLS client certificates per environment. Record the date the
        certificate was generated so the system can track expiry and warn you
        before it becomes invalid.
        <br />
        <strong>Staging:</strong> 3-year validity &nbsp;|&nbsp;{" "}
        <strong>Production:</strong> 5-year validity
        <br />
        Renewal is recommended at least <strong>1 month before expiry</strong>.
      </Typography>

      <Grid2 container spacing={3}>
        {/* Environment selector */}
        <Grid2 xs={12}>
          <TextField
            select
            fullWidth
            required
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                Environment
                <Tooltip
                  placement="top"
                  arrow
                  title="Select whether this certificate was issued for the STC Staging (test) environment or Production. Staging certificates are valid for 3 years; Production certificates are valid for 5 years. Using the wrong environment will cause the expiry calculation to be incorrect."
                >
                  <InfoOutlinedIcon sx={{ fontSize: 13, cursor: "help", opacity: 0.55 }} />
                </Tooltip>
              </Box>
            }
            value={values.sslEnvironment ?? ""}
            onChange={(e) => onChange("sslEnvironment", e.target.value)}
            helperText="Staging = 3-year cert · Production = 5-year cert"
            inputProps={{ style: { fontSize: 15 } }}
            InputLabelProps={{ sx: { fontSize: 15 } }}
            FormHelperTextProps={{ sx: { fontSize: 12.5 } }}
          >
            <MenuItem value="staging">Staging (Testing)</MenuItem>
            <MenuItem value="production">Production</MenuItem>
          </TextField>
        </Grid2>

        {/* Certificate generation date */}
        <Grid2 xs={12}>
          <TextField
            fullWidth
            required
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                Certificate Generation Date
                <Tooltip
                  placement="top"
                  arrow
                  title="The exact date STC generated and issued this mTLS certificate. The system uses this date to calculate when the certificate will expire and warn you before it becomes invalid. You can find this date in the certificate file or in the email STC sent when they issued it."
                >
                  <InfoOutlinedIcon sx={{ fontSize: 13, cursor: "help", opacity: 0.55 }} />
                </Tooltip>
              </Box>
            }
            type="date"
            value={values.sslCertGeneratedAt ?? ""}
            onChange={(e) => onChange("sslCertGeneratedAt", e.target.value)}
            helperText="Used to calculate expiry — check your STC certificate file or onboarding email"
            InputLabelProps={{ shrink: true, sx: { fontSize: 15 } }}
            inputProps={{ max: new Date().toISOString().split("T")[0], style: { fontSize: 15 } }}
            FormHelperTextProps={{ sx: { fontSize: 12.5 } }}
          />
        </Grid2>

        {/* Computed expiry display */}
        {expiry && (
          <Grid2 xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" fontWeight={600}>
                  Certificate Expiry
                </Typography>
                <Chip label={chipLabel} color={chipColor} size="small" />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Expires on:{" "}
                <strong>
                  {expiry.expiryDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Environment:{" "}
                <strong style={{ textTransform: "capitalize" }}>
                  {values.sslEnvironment}
                </strong>{" "}
                ({EXPIRY_YEARS[values.sslEnvironment]}-year certificate)
              </Typography>
            </Box>
          </Grid2>
        )}

        {/* Warning / alert banners */}
        {expiry?.isExpired && (
          <Grid2 xs={12}>
            <Alert severity="error">
              <strong>Certificate has expired!</strong> Renew immediately to
              avoid STC API failures. Contact STC to obtain a new certificate.
            </Alert>
          </Grid2>
        )}

        {expiry?.isWarning && (
          <Grid2 xs={12}>
            <Alert severity="error">
              <strong>Certificate expires in {expiry.daysRemaining} day{expiry.daysRemaining !== 1 ? "s" : ""}!</strong>{" "}
              Start the renewal process immediately — STC recommends beginning
              at least 1 month before expiry.
            </Alert>
          </Grid2>
        )}

        {expiry?.isCaution && (
          <Grid2 xs={12}>
            <Alert severity="warning">
              Certificate expires in <strong>{expiry.daysRemaining} days</strong>{" "}
              ({expiry.expiryDate.toLocaleDateString()}). Plan renewal to avoid
              any disruption to Qitaf services.
            </Alert>
          </Grid2>
        )}
      </Grid2>
    </Box>
  );
};

export default SslCertificateTab;
