"use client";

import React, { useEffect, useState } from "react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import BaseDrawer from "@/components/drawer/basedrawer";
import QitafConfigForm from "./QitafConfigForm";
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

// Yup schema for Qitaf config validation
const qitafSchema = yup.object().shape({
  environment: yup.string().required("Environment is required"),
  apiBaseUrl: yup.string().url("Must be a valid URL").required("API Base URL is required"),
  branchId: yup.string().required("Branch ID is required"),
  terminalId: yup.string().required("Terminal ID is required"),
  timeoutSeconds: yup
    .number()
    .min(1)
    .required("Timeout is required"),
  otpValidityMinutes: yup
    .number()
    .min(1)
    .required("OTP validity is required"),
  pointToAmountRatio: yup
    .number()
    .min(0.01)
    .required("Points to SAR ratio is required"),
  refundPeriodDays: yup
    .number()
    .min(0)
    .required("Refund period is required"),
});

const defaultQitafValues: QitafConfig = {
  environment: "test",
  apiBaseUrl: "",
  branchId: "",
  terminalId: "",
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
  const [values, setValues] = useState<Record<string, any>>(defaultQitafValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Pre-populate from existing config
  useEffect(() => {
    if (tenantConfig?.configuration) {
      setValues({ ...defaultQitafValues, ...tenantConfig.configuration });
    } else {
      setValues(defaultQitafValues);
    }
    setCertificateFile(null);
    setErrors({});
  }, [tenantConfig, open]);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const handleSave = async () => {
    try {
      await qitafSchema.validate(values, { abortEarly: false });
      setErrors({});
      setSaving(true);

      let certificateUrl = (tenantConfig?.configuration as QitafConfig)?.certificateUrl;

      // Upload certificate file if a new one was selected
      if (certificateFile) {
        const uploaded = await tenantIntegrationService.uploadCertificate(certificateFile);
        certificateUrl = uploaded.url;
      }

      const configuration = {
        ...values,
        ...(certificateUrl ? { certificateUrl } : {}),
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
      } else {
        toast.error(err?.response?.data?.message || "Failed to save configuration");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseDrawer
      open={open}
      onClose={onClose}
      title={`Configure ${integrationName}`}
      width={480}
    >
      <Grid2 container spacing={3}>
        <Grid2 xs={12}>
          <Typography variant="body2" color="text.secondary">
            Set the credentials and parameters for this integration. Configuration is stored per tenant.
          </Typography>
        </Grid2>

        <Grid2 xs={12}>
          <QitafConfigForm
            values={values}
            errors={errors}
            onChange={handleChange}
            certificateFile={certificateFile}
            onCertificateChange={setCertificateFile}
            existingCertificateUrl={(tenantConfig?.configuration as QitafConfig)?.certificateUrl}
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
              {tenantConfig?.id ? "Update Configuration" : "Save & Enable"}
            </Button>
          </Box>
        </Grid2>
      </Grid2>
    </BaseDrawer>
  );
};

export default ConfigureIntegrationDrawer;
