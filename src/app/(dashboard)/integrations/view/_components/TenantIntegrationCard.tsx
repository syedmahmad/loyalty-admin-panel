"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import SettingsIcon from "@mui/icons-material/Settings";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { toast } from "react-toastify";
import { tenantIntegrationService } from "@/services/tenantIntegrationService";
import ConfigureIntegrationDrawer from "./ConfigureIntegrationDrawer";
import { computeSslExpiry } from "./SslCertificateTab";
import type { GlobalIntegration, TenantIntegrationConfig } from "@/types/integration.types";

interface Props {
  integration: GlobalIntegration;
  tenantConfig: TenantIntegrationConfig | null;
  tenantId: number;
  reFetch: () => void;
}

const TenantIntegrationCard = ({
  integration,
  tenantConfig,
  tenantId,
  reFetch,
}: Props) => {
  const theme = useTheme();
  const [toggling, setToggling] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);

  const isEnabled = tenantConfig?.isEnabled ?? false;
  const isConfigured = !!tenantConfig?.id;

  const sslExpiry = computeSslExpiry(
    (tenantConfig?.configuration as any)?.sslCertGeneratedAt,
    (tenantConfig?.configuration as any)?.sslEnvironment,
  );

  const handleToggle = async () => {
    if (!isConfigured && !isEnabled) {
      // Not yet configured — open configure drawer instead
      setConfigureOpen(true);
      return;
    }

    try {
      setToggling(true);
      if (isEnabled) {
        await tenantIntegrationService.toggleEnabled(tenantConfig!.id, false);
        toast.success(`${integration.name} disabled for this tenant`);
      } else {
        await tenantIntegrationService.toggleEnabled(tenantConfig!.id, true);
        toast.success(`${integration.name} enabled for this tenant`);
      }
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update integration status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <Grid2
        container
        spacing={2}
        sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${isEnabled ? theme.palette.primary.light : "#e0e0e0"}`,
          background: isEnabled
            ? `linear-gradient(135deg, ${theme.palette.primary.light}15, #fff)`
            : "#fafafa",
          transition: "all 0.2s ease",
          minHeight: 180,
        }}
      >
        {/* Header: icon + name + type */}
        <Grid2 xs={12}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                background: isEnabled ? theme.palette.primary.main : "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s ease",
              }}
            >
              <IntegrationInstructionsIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box flex={1}>
              <Typography fontWeight={700} fontSize="16px" color={theme.palette.primary.dark}>
                {integration.name}
              </Typography>
            </Box>
            {/* Configured status indicator */}
            <Box>
              {isConfigured ? (
                <CheckCircleOutlineIcon
                  sx={{ color: theme.palette.success.main, fontSize: 20 }}
                  titleAccess="Configured"
                />
              ) : (
                <RadioButtonUncheckedIcon
                  sx={{ color: "#bdbdbd", fontSize: 20 }}
                  titleAccess="Not configured"
                />
              )}
            </Box>
          </Box>
        </Grid2>

        {/* Description */}
        {integration.description && (
          <Grid2 xs={12}>
            <Typography variant="body2" color="text.secondary">
              {integration.description}
            </Typography>
          </Grid2>
        )}

        {/* Status badge + SSL expiry badge */}
        <Grid2 xs={12}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Chip
              label={isConfigured ? (isEnabled ? "Active" : "Disabled") : "Not configured"}
              size="small"
              color={isEnabled ? "success" : "default"}
              variant={isEnabled ? "filled" : "outlined"}
            />
            {sslExpiry && (
              <Chip
                label={
                  sslExpiry.isExpired
                    ? "SSL Expired"
                    : sslExpiry.isWarning
                      ? `SSL expires in ${sslExpiry.daysRemaining}d`
                      : sslExpiry.isCaution
                        ? `SSL ${sslExpiry.daysRemaining}d left`
                        : `SSL valid`
                }
                size="small"
                color={
                  sslExpiry.isExpired || sslExpiry.isWarning
                    ? "error"
                    : sslExpiry.isCaution
                      ? "warning"
                      : "success"
                }
                variant="outlined"
                onClick={() => setConfigureOpen(true)}
                sx={{ cursor: "pointer" }}
              />
            )}
          </Box>
        </Grid2>

        {/* Actions: toggle + configure */}
        <Grid2 xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <FormControlLabel
              control={
                toggling ? (
                  <CircularProgress size={20} sx={{ mx: 1.5 }} />
                ) : (
                  <Switch
                    checked={isEnabled}
                    onChange={handleToggle}
                    color="primary"
                    disabled={toggling}
                  />
                )
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  {isEnabled ? "Enabled" : "Enable"}
                </Typography>
              }
            />

            <Button
              variant="outlined"
              size="small"
              startIcon={<SettingsIcon fontSize="small" />}
              onClick={() => setConfigureOpen(true)}
            >
              {isConfigured ? "Reconfigure" : "Configure"}
            </Button>
          </Box>
        </Grid2>
      </Grid2>

      <ConfigureIntegrationDrawer
        open={configureOpen}
        onClose={() => setConfigureOpen(false)}
        tenantConfig={tenantConfig}
        tenantId={tenantId}
        integrationId={integration.id}
        integrationName={integration.name}
        reFetch={reFetch}
      />
    </>
  );
};

export default TenantIntegrationCard;
