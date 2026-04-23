"use client";

import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  TextField,
  MenuItem,
  Typography,
  Box,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CustomTextfield } from "@/components/CustomTextField";
import type { SchemaField } from "@/types/integration.types";
import { INTEGRATION_SCHEMAS, ACCOUNT_INFO_SCHEMAS } from "@/constants/integrationSchemas";

interface Props {
  partnerId: number;
  /** Which schema to render: "account" = STC Account tab, "config" = General Config tab (default) */
  schemaSource?: "account" | "config";
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (key: string, value: any) => void;
}

/** Renders a label string with an info icon tooltip if tooltip text is provided. */
const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip?: string }) => {
  if (!tooltip) return <>{label}</>;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {label}
      <Tooltip title={tooltip} placement="top" arrow>
        <InfoOutlinedIcon
          sx={{ fontSize: 13, cursor: "help", opacity: 0.55, verticalAlign: "middle" }}
        />
      </Tooltip>
    </Box>
  );
};

const QitafConfigForm = ({ partnerId, schemaSource = "config", values, errors, onChange }: Props) => {
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  const schema =
    schemaSource === "account"
      ? (ACCOUNT_INFO_SCHEMAS[partnerId] ?? [])
      : (INTEGRATION_SCHEMAS[partnerId] ?? []);

  const isVisible = (field: SchemaField) => {
    if (!field.showWhen) return true;
    return values[field.showWhen.key] === field.showWhen.value;
  };

  const toggleVisibility = (key: string) =>
    setVisibleSecrets((prev) => ({ ...prev, [key]: !prev[key] }));

  const copyToClipboard = (key: string) => {
    const val = values[key] ?? "";
    if (val) navigator.clipboard.writeText(val);
  };

  const renderField = (field: SchemaField, index: number) => {
    if (!isVisible(field)) return null;

    const sectionHeader = field.sectionTitle ? (
      <Grid2 xs={12} key={`section-${field.key}`}>
        <Box mt={index === 0 ? 0 : 1}>
          <Typography
            fontWeight={700}
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing={0.8}
            sx={{ fontSize: 12 }}
          >
            {field.sectionTitle}
          </Typography>
          <Divider sx={{ mt: 0.5, mb: 0.5 }} />
        </Box>
      </Grid2>
    ) : null;

    const fieldLabel = <LabelWithTooltip label={field.label} tooltip={field.tooltip} />;

    let fieldEl: React.ReactNode;

    if (field.secret) {
      const revealed = !!visibleSecrets[field.key];
      fieldEl = (
        <Grid2 xs={12} key={field.key}>
          <TextField
            required={field.required}
            fullWidth
            label={fieldLabel}
            type={revealed ? "text" : "password"}
            value={values[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            error={!!errors[field.key]}
            helperText={errors[field.key] || field.helperText}
            inputProps={{ dir: "ltr", style: { fontSize: 15 } }}
            InputLabelProps={{ sx: { fontSize: 15 } }}
            FormHelperTextProps={{ sx: { fontSize: 12.5 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={revealed ? "Hide" : "Show"}>
                    <IconButton size="small" onClick={() => toggleVisibility(field.key)}>
                      {revealed ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy">
                    <IconButton size="small" onClick={() => copyToClipboard(field.key)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid2>
      );
    } else if (field.type === "select") {
      fieldEl = (
        <Grid2 xs={12} key={field.key}>
          <TextField
            required={field.required}
            select
            fullWidth
            label={fieldLabel}
            value={values[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            error={!!errors[field.key]}
            helperText={errors[field.key] || field.helperText}
            inputProps={{ style: { fontSize: 15 } }}
            InputLabelProps={{ sx: { fontSize: 15 } }}
            FormHelperTextProps={{ sx: { fontSize: 12.5 } }}
          >
            {(field.options ?? []).map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>
      );
    } else {
      // text, number, textarea
      fieldEl = (
        <Grid2 xs={12} key={field.key}>
          <CustomTextfield
            required={field.required}
            fullWidth
            multiline={field.type === "textarea"}
            rows={field.type === "textarea" ? 5 : undefined}
            type={field.type === "number" ? "number" : "text"}
            label={fieldLabel}
            value={values[field.key] ?? (field.default !== undefined ? field.default : "")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(
                field.key,
                field.type === "number" ? Number(e.target.value) : e.target.value,
              )
            }
            error={!!errors[field.key]}
            helperText={errors[field.key] || field.helperText}
            inputProps={{
              dir: "ltr",
              style:
                field.type === "textarea"
                  ? { fontFamily: "monospace", fontSize: 14 }
                  : { fontSize: 15 },
            }}
            InputLabelProps={{ sx: { fontSize: 15 } }}
            FormHelperTextProps={{ sx: { fontSize: 12.5 } }}
          />
        </Grid2>
      );
    }

    return (
      <React.Fragment key={field.key}>
        {sectionHeader}
        {fieldEl}
      </React.Fragment>
    );
  };

  return (
    <Grid2 container spacing={2}>
      {schema.map((field, index) => renderField(field, index))}
    </Grid2>
  );
};

export default QitafConfigForm;
