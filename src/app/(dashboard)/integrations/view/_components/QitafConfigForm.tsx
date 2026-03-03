"use client";

import React, { useRef } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  TextField,
  MenuItem,
  Typography,
  Box,
  Button,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CustomTextfield } from "@/components/CustomTextField";
import type { SchemaField } from "@/types/integration.types";
import { INTEGRATION_SCHEMAS } from "@/constants/integrationSchemas";

interface Props {
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (key: string, value: any) => void;
  certificateFile: File | null;
  onCertificateChange: (file: File | null) => void;
  existingCertificateUrl?: string;
}

const QitafConfigForm = ({
  values,
  errors,
  onChange,
  certificateFile,
  onCertificateChange,
  existingCertificateUrl,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schema = INTEGRATION_SCHEMAS.QITAF;

  const isVisible = (field: SchemaField) => {
    if (!field.showWhen) return true;
    return values[field.showWhen.key] === field.showWhen.value;
  };

  const renderField = (field: SchemaField) => {
    if (!isVisible(field)) return null;

    if (field.type === "select") {
      return (
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
    }

    if (field.type === "file") {
      const hasExisting = !!existingCertificateUrl;
      const hasNew = !!certificateFile;

      return (
        <Grid2 xs={12} key={field.key}>
          <Typography variant="body2" fontWeight={600} mb={0.5}>
            {field.label}
            {field.helperText && (
              <Tooltip title={field.helperText} placement="right">
                <InfoOutlinedIcon
                  fontSize="small"
                  sx={{ ml: 0.5, verticalAlign: "middle", color: "text.secondary" }}
                />
              </Tooltip>
            )}
          </Typography>

          {/* Show current cert status */}
          {(hasExisting || hasNew) && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label={hasNew ? certificateFile!.name : "Existing certificate"}
                size="small"
                color={hasNew ? "primary" : "default"}
                variant="outlined"
                onDelete={() => {
                  onCertificateChange(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
            </Box>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={field.accept}
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onCertificateChange(file);
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            {hasExisting || hasNew ? "Replace Certificate" : "Upload Certificate"}
          </Button>

          {errors[field.key] && (
            <Typography variant="caption" color="error" display="block" mt={0.5}>
              {errors[field.key]}
            </Typography>
          )}
        </Grid2>
      );
    }

    // text / number / textarea
    return (
      <Grid2 xs={12} key={field.key}>
        <CustomTextfield
          required={field.required}
          fullWidth
          multiline={field.type === "textarea"}
          rows={field.type === "textarea" ? 4 : undefined}
          type={field.type === "number" ? "number" : "text"}
          label={field.label}
          value={values[field.key] ?? (field.default !== undefined ? field.default : "")}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)
          }
          error={!!errors[field.key]}
          helperText={errors[field.key] || field.helperText}
          inputProps={{ dir: "ltr" }}
        />
      </Grid2>
    );
  };

  return (
    <Grid2 container spacing={3}>
      {schema.map(renderField)}
    </Grid2>
  );
};

export default QitafConfigForm;
