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
  Divider,
  Tooltip,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CustomTextfield } from "@/components/CustomTextField";
import type { SchemaField } from "@/types/integration.types";
import { INTEGRATION_SCHEMAS } from "@/constants/integrationSchemas";

interface Props {
  partnerId: number;
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (key: string, value: any) => void;
  // Generic file handling — keyed by schema field key
  files: Record<string, File | null>;
  onFileChange: (fieldKey: string, file: File | null) => void;
  existingFileUrls: Record<string, string | undefined>;
}

const QitafConfigForm = ({
  partnerId,
  values,
  errors,
  onChange,
  files,
  onFileChange,
  existingFileUrls,
}: Props) => {
  // One ref per file field — stored in a map by field key
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const schema = INTEGRATION_SCHEMAS[partnerId] ?? [];

  const isVisible = (field: SchemaField) => {
    if (!field.showWhen) return true;
    return values[field.showWhen.key] === field.showWhen.value;
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

    if (field.type === "select") {
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
    } else if (field.type === "file") {
      const currentFile = files[field.key] ?? null;
      const existingUrl = existingFileUrls[field.key];
      const hasExisting = !!existingUrl;
      const hasNew = !!currentFile;

      fieldEl = (
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

          {(hasExisting || hasNew) && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label={hasNew ? currentFile!.name : "Uploaded ✓"}
                size="small"
                color={hasNew ? "primary" : "success"}
                variant="outlined"
                onDelete={
                  hasNew
                    ? () => {
                        onFileChange(field.key, null);
                        if (fileInputRefs.current[field.key]) {
                          fileInputRefs.current[field.key]!.value = "";
                        }
                      }
                    : undefined
                }
              />
              {hasExisting && !hasNew && (
                <Typography variant="caption" color="text.secondary">
                  <a href={existingUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                </Typography>
              )}
            </Box>
          )}

          <input
            ref={(el) => { fileInputRefs.current[field.key] = el; }}
            type="file"
            accept={field.accept}
            style={{ display: "none" }}
            onChange={(e) => onFileChange(field.key, e.target.files?.[0] ?? null)}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRefs.current[field.key]?.click()}
          >
            {hasExisting || hasNew ? `Replace ${field.label}` : `Upload ${field.label}`}
          </Button>

          {errors[field.key] && (
            <Typography variant="caption" color="error" display="block" mt={0.5}>
              {errors[field.key]}
            </Typography>
          )}
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
