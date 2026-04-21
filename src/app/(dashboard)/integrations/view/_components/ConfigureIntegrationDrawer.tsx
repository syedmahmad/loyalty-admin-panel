"use client";

import React, { useEffect, useState } from "react";
import { Button, Box, Typography, CircularProgress, Tabs, Tab } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BaseDrawer from "@/components/drawer/basedrawer";
import QitafConfigForm from "./QitafConfigForm";
import SslCertificateTab from "./SslCertificateTab";
import TerminalMappingTab from "./TerminalMappingTab";
import AuthenticationTab from "./PosApiTokenTab";
import { tenantIntegrationService } from "@/services/tenantIntegrationService";
import { toast } from "react-toastify";
import * as yup from "yup";
import type { TenantIntegrationConfig } from "@/types/integration.types";
import { INTEGRATION_SCHEMAS, ACCOUNT_INFO_SCHEMAS } from "@/constants/integrationSchemas";
import { computeSslExpiry } from "./SslCertificateTab";

interface Props {
  open: boolean;
  onClose: () => void;
  tenantConfig: TenantIntegrationConfig | null;
  tenantId: number;
  integrationId: number;
  integrationName: string;
  reFetch: () => void;
}

const TAB_ACCOUNT = 0;
const TAB_CONFIG = 1;
const TAB_SSL = 2;
const TAB_TERMINALS = 3;
const TAB_TOKEN = 4;

const buildSchemaAndDefaults = (integrationId: number) => {
  const accountFields = ACCOUNT_INFO_SCHEMAS[integrationId] ?? [];
  const configFields = INTEGRATION_SCHEMAS[integrationId] ?? [];
  const allFields = [...accountFields, ...configFields];

  const shape: Record<string, yup.AnySchema> = {};
  const defaults: Record<string, any> = {
    // SSL fields — not in schema arrays, but included in config JSON
    sslEnvironment: "",
    sslCertGeneratedAt: "",
  };

  for (const field of allFields) {
    defaults[field.key] = field.type === "number" ? (field.default ?? 0) : (field.default ?? "");

    if (!field.required) continue;
    if (field.type === "number") {
      shape[field.key] = yup.number().min(0).required(`${field.label} is required`);
    } else if (field.format === "url") {
      shape[field.key] = yup.string().url("Must be a valid URL").required(`${field.label} is required`);
    } else {
      shape[field.key] = yup.string().required(`${field.label} is required`);
    }
  }

  return { schema: yup.object().shape(shape), defaults };
};

/** Returns which tab a given field key lives in */
const getFieldTab = (key: string, integrationId: number): number => {
  const accountKeys = (ACCOUNT_INFO_SCHEMAS[integrationId] ?? []).map((f) => f.key);
  if (accountKeys.includes(key)) return TAB_ACCOUNT;
  if (key === "sslEnvironment" || key === "sslCertGeneratedAt") return TAB_SSL;
  return TAB_CONFIG;
};

const ConfigureIntegrationDrawer = ({
  open,
  onClose,
  tenantConfig,
  tenantId,
  integrationId,
  integrationName,
  reFetch,
}: Props) => {
  const { schema: configSchema, defaults: defaultValues } = React.useMemo(
    () => buildSchemaAndDefaults(integrationId),
    [integrationId],
  );

  const [activeTab, setActiveTab] = useState(TAB_ACCOUNT);
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(TAB_ACCOUNT);
      setValues(
        tenantConfig?.configuration
          ? { ...defaultValues, ...tenantConfig.configuration }
          : defaultValues,
      );
      setErrors({});
    }
  }, [tenantConfig, open]);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSave = async () => {
    try {
      await configSchema.validate(values, { abortEarly: false });
      setErrors({});
      setSaving(true);

      if (tenantConfig?.id) {
        await tenantIntegrationService.update(tenantConfig.id, { configuration: values });
        toast.success("Configuration updated successfully");
      } else {
        await tenantIntegrationService.create({
          tenantId,
          integrationId,
          isEnabled: true,
          configuration: values,
        });
        toast.success("Integration configured and enabled successfully");
      }

      reFetch();
      onClose();
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const fieldErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);

        // Navigate to the first tab that has an error
        const firstErrorKey = Object.keys(fieldErrors)[0];
        if (firstErrorKey) {
          setActiveTab(getFieldTab(firstErrorKey, integrationId));
        }
      } else {
        toast.error(err?.response?.data?.message || "Failed to save configuration");
      }
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = (tab: number): boolean => {
    return Object.keys(errors).some((key) => getFieldTab(key, integrationId) === tab);
  };

  const canAccessTab = (tab: number): boolean => {
    if (tab === TAB_TERMINALS || tab === TAB_TOKEN) return !!tenantConfig?.id;
    return true;
  };

  const sslExpiry = computeSslExpiry(values.sslCertGeneratedAt, values.sslEnvironment);

  const SaveButton = () => (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleSave}
      disabled={saving}
      startIcon={saving ? <CircularProgress size={16} /> : undefined}
    >
      {saving ? "Saving…" : tenantConfig?.id ? "Update Configuration" : "Save & Enable"}
    </Button>
  );

  return (
    <BaseDrawer
      open={open}
      onClose={onClose}
      title={`Configure ${integrationName}`}
      width={560}
    >
      <Box>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="STC Account"
            value={TAB_ACCOUNT}
            sx={{ color: hasErrors(TAB_ACCOUNT) ? "error.main" : undefined }}
          />
          <Tab
            label="STC Config"
            value={TAB_CONFIG}
            sx={{ color: hasErrors(TAB_CONFIG) ? "error.main" : undefined }}
          />
          <Tab
            label={
              sslExpiry && (sslExpiry.isExpired || sslExpiry.isWarning)
                ? "SSL Certificate ⚠"
                : "SSL Certificate"
            }
            value={TAB_SSL}
            sx={{
              color:
                sslExpiry && (sslExpiry.isExpired || sslExpiry.isWarning)
                  ? "error.main"
                  : sslExpiry?.isCaution
                    ? "warning.main"
                    : undefined,
            }}
          />
          <Tab label="Branch & Terminal" value={TAB_TERMINALS} disabled={!canAccessTab(TAB_TERMINALS)} />
          <Tab label="POS Settings" value={TAB_TOKEN} disabled={!canAccessTab(TAB_TOKEN)} />
        </Tabs>

        {!tenantConfig?.id && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5, mb: 1 }}
          >
            Save config first to enable terminal mapping and token management.
          </Typography>
        )}

        <Box mt={2}>
          {/* Tab 0 — STC Account */}
          {activeTab === TAB_ACCOUNT && (
            <Grid2 container spacing={3}>
              <Grid2 xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Enter your STC account details. These identify your organisation within STC&apos;s system.
                </Typography>
              </Grid2>
              <Grid2 xs={12}>
                <QitafConfigForm
                  partnerId={integrationId}
                  schemaSource="account"
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                />
              </Grid2>
              <Grid2 xs={12}>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <SaveButton />
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => setActiveTab(TAB_CONFIG)}
                  >
                    Next
                  </Button>
                </Box>
              </Grid2>
            </Grid2>
          )}

          {/* Tab 1 — General Config */}
          {activeTab === TAB_CONFIG && (
            <Grid2 container spacing={3}>
              <Grid2 xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Set the API credentials and operational parameters for this integration.
                </Typography>
              </Grid2>
              <Grid2 xs={12}>
                <QitafConfigForm
                  partnerId={integrationId}
                  schemaSource="config"
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                />
              </Grid2>
              <Grid2 xs={12}>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setActiveTab(TAB_ACCOUNT)}
                  >
                    Back
                  </Button>
                  <Box display="flex" gap={1}>
                    <SaveButton />
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => setActiveTab(TAB_SSL)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
          )}

          {/* Tab 2 — SSL Certificate */}
          {activeTab === TAB_SSL && (
            <Grid2 container spacing={3}>
              <Grid2 xs={12}>
                <SslCertificateTab values={values} onChange={handleChange} />
              </Grid2>
              <Grid2 xs={12}>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setActiveTab(TAB_CONFIG)}
                  >
                    Back
                  </Button>
                  <Box display="flex" gap={1}>
                    <SaveButton />
                    {canAccessTab(TAB_TERMINALS) && (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => setActiveTab(TAB_TERMINALS)}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
          )}

          {/* Tab 3 — Branch & Terminal Mapping */}
          {activeTab === TAB_TERMINALS && tenantConfig?.id && (
            <Box>
              <TerminalMappingTab integrationId={tenantConfig.id} />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setActiveTab(TAB_SSL)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setActiveTab(TAB_TOKEN)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 4 — POS Settings */}
          {activeTab === TAB_TOKEN && tenantConfig?.id && (
            <Box>
              <AuthenticationTab values={values} onChange={handleChange} />
              <Box display="flex" justifyContent="flex-start" mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setActiveTab(TAB_TERMINALS)}
                >
                  Back
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </BaseDrawer>
  );
};

export default ConfigureIntegrationDrawer;
