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
import type { TenantIntegrationConfig, QitafConfig } from "@/types/integration.types";

interface Props {
  open: boolean;
  onClose: () => void;
  tenantConfig: TenantIntegrationConfig | null;
  tenantId: number;
  integrationId: number;
  integrationName: string;
  reFetch: () => void;
}

const configSchema = yup.object().shape({
  environment: yup.string().required("Environment is required"),
  apiBaseUrl: yup.string().url("Must be a valid URL").required("API Base URL is required"),
  secretToken: yup.string().required("Secret Token is required"),
  authUsername: yup.string().required("Auth Username is required"),
  authPassword: yup.string().required("Auth Password is required"),
  timeoutSeconds: yup.number().min(1).required("Timeout is required"),
  otpValidityMinutes: yup.number().min(1).required("OTP validity is required"),
  pointToAmountRatio: yup.number().min(0.01).required("Points to SAR ratio is required"),
  refundPeriodDays: yup.number().min(0).required("Refund period is required"),
});

const defaultValues: Record<string, any> = {
  environment: "test",
  apiBaseUrl: "",
  secretToken: "",
  authUsername: "",
  authPassword: "",
  timeoutSeconds: 60,
  otpValidityMinutes: 3,
  pointToAmountRatio: 0,
  refundPeriodDays: 0,
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
  const [activeTab, setActiveTab] = useState(0);
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Generic file map: { certificateFile: File|null, privateKeyFile: File|null }
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setValues(
        tenantConfig?.configuration
          ? { ...defaultValues, ...tenantConfig.configuration }
          : defaultValues,
      );
      setPendingFiles({});
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

  const handleFileChange = (fieldKey: string, file: File | null) => {
    setPendingFiles((prev) => ({ ...prev, [fieldKey]: file }));
  };

  const handleSave = async () => {
    try {
      await configSchema.validate(values, { abortEarly: false });
      setErrors({});
      setSaving(true);

      const existingConfig = tenantConfig?.configuration as QitafConfig | undefined;

      // Upload any pending files to OCI
      let certificateUrl = existingConfig?.certificateUrl;
      let privateKeyUrl = existingConfig?.privateKeyUrl;

      if (pendingFiles.certificateFile) {
        const res = await tenantIntegrationService.uploadCertificate(pendingFiles.certificateFile);
        certificateUrl = res.url;
      }
      if (pendingFiles.privateKeyFile) {
        const res = await tenantIntegrationService.uploadCertificate(pendingFiles.privateKeyFile);
        privateKeyUrl = res.url;
      }

      const configuration = {
        ...values,
        ...(certificateUrl ? { certificateUrl } : {}),
        ...(privateKeyUrl ? { privateKeyUrl } : {}),
      };

      if (tenantConfig?.id) {
        await tenantIntegrationService.update(tenantConfig.id, { configuration });
        toast.success("Configuration updated successfully");
      } else {
        await tenantIntegrationService.create({
          tenantId,
          integrationId,
          isEnabled: true,
          configuration,
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

  const existingConfig = tenantConfig?.configuration as QitafConfig | undefined;
  const existingFileUrls: Record<string, string | undefined> = {
    certificateFile: existingConfig?.certificateUrl,
    privateKeyFile: existingConfig?.privateKeyUrl,
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
                files={pendingFiles}
                onFileChange={handleFileChange}
                existingFileUrls={existingFileUrls}
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
