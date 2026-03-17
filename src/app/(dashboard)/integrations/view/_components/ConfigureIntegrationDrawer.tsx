"use client";

import React, { useEffect, useState } from "react";
import { Button, Box, Typography, CircularProgress, Tabs, Tab } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import BaseDrawer from "@/components/drawer/basedrawer";
import QitafConfigForm from "./QitafConfigForm";
import TerminalMappingTab from "./TerminalMappingTab";
import { tenantIntegrationService } from "@/services/tenantIntegrationService";
import { toast } from "react-toastify";
import * as yup from "yup";
import type { TenantIntegrationConfig } from "@/types/integration.types";
import { INTEGRATION_SCHEMAS } from "@/constants/integrationSchemas";

interface Props {
  open: boolean;
  onClose: () => void;
  tenantConfig: TenantIntegrationConfig | null;
  tenantId: number;
  integrationId: number;
  integrationName: string;
  reFetch: () => void;
}

const buildSchemaAndDefaults = (integrationId: number) => {
  const fields = INTEGRATION_SCHEMAS[integrationId] ?? [];
  const shape: Record<string, yup.AnySchema> = {};
  const defaults: Record<string, any> = {};

  for (const field of fields) {
    // Default value
    defaults[field.key] = field.type === "number" ? (field.default ?? 0) : (field.default ?? "");

    // Validation — only required fields
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

  const [activeTab, setActiveTab] = useState(0);
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(0);
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
        setActiveTab(0);
      } else {
        toast.error(err?.response?.data?.message || "Failed to save configuration");
      }
    } finally {
      setSaving(false);
    }
  };

  const terminalTabDisabled = !tenantConfig?.id;

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
        >
          <Tab label="General Config" value={0} />
          <Tab label="Branch & Terminal Mapping" value={1} disabled={terminalTabDisabled} />
        </Tabs>

        {terminalTabDisabled ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5, mb: 2 }}
          >
            Save general config first to enable branch mapping.
          </Typography>
        ) : (
          <Box mb={2} />
        )}

        {activeTab === 0 && (
          <Grid2 container spacing={3}>
            <Grid2 xs={12}>
              <Typography variant="body2" color="text.secondary">
                Set the credentials and parameters for this integration. Configuration is stored
                per tenant.
              </Typography>
            </Grid2>

            <Grid2 xs={12}>
              <QitafConfigForm
                partnerId={integrationId}
                values={values}
                errors={errors}
                onChange={handleChange}
              />
            </Grid2>

            <Grid2 xs={12}>
              <Box display="flex" justifyContent="center" mt={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : undefined}
                >
                  {saving
                    ? "Saving…"
                    : tenantConfig?.id
                      ? "Update Configuration"
                      : "Save & Enable"}
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        )}

        {activeTab === 1 && tenantConfig?.id && (
          <TerminalMappingTab integrationId={tenantConfig.id} />
        )}
      </Box>
    </BaseDrawer>
  );
};

export default ConfigureIntegrationDrawer;
