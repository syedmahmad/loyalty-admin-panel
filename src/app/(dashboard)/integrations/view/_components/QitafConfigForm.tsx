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
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing={0.8}
          >
            {field.sectionTitle}
          </Typography>
          <Divider sx={{ mt: 0.5, mb: 0.5 }} />
        </Box>
      </Grid2>
    ) : null;

    let fieldEl: React.ReactNode;

    if (field.secret) {
      const revealed = !!visibleSecrets[field.key];
      fieldEl = (
        <Grid2 xs={12} key={field.key}>
          <TextField
            required={field.required}
            fullWidth
            label={field.label}
            type={revealed ? "text" : "password"}
            value={values[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            error={!!errors[field.key]}
            helperText={errors[field.key] || field.helperText}
            inputProps={{ dir: "ltr" }}
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
            label={field.label}
            value={values[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            error={!!errors[field.key]}
            helperText={errors[field.key] || field.helperText}
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
            label={field.label}
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
                  ? { fontFamily: "monospace", fontSize: 12 }
                  : undefined,
            }}
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
