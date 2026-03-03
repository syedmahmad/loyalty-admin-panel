"use client";

import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { integrationService } from "@/services/integrationService";
import { toast } from "react-toastify";
import * as yup from "yup";
import { INTEGRATION_TYPE_LABELS } from "@/constants/integrationSchemas";
import type { IntegrationType } from "@/types/integration.types";

const INTEGRATION_TYPES = Object.keys(INTEGRATION_TYPE_LABELS) as IntegrationType[];

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Integration type is required"),
  description: yup.string(),
});

interface Props {
  reFetch: () => void;
}

const CreateIntegration = ({ reFetch }: Props) => {
  const theme = useTheme();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    type: "" as IntegrationType | "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await schema.validate(form, { abortEarly: false });
      setFormErrors({});

      await integrationService.create({
        name: form.name,
        type: form.type as IntegrationType,
        description: form.description || undefined,
        isActive: true,
      });

      toast.success("Partner added successfully");
      reFetch();
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const errors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          errors[e.path] = e.message;
        });
        setFormErrors(errors);
      } else {
        toast.error(err?.response?.data?.message || "Failed to create integration");
      }
    }
  };

  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={12}>
        <CustomTextfield
          required
          fullWidth
          name="name"
          label="Partner Name"
          value={form.name}
          onChange={handleChange}
          error={!!formErrors.name}
          helperText={formErrors.name}
          inputProps={{ dir: "ltr" }}
        />
      </Grid2>

      <Grid2 xs={12}>
        <TextField
          required
          select
          fullWidth
          name="type"
          label="Partner Type"
          value={form.type}
          onChange={handleChange as any}
          error={!!formErrors.type}
          helperText={formErrors.type}
        >
          {INTEGRATION_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {INTEGRATION_TYPE_LABELS[t]}
            </MenuItem>
          ))}
        </TextField>
      </Grid2>

      <Grid2 xs={12}>
        <CustomTextfield
          fullWidth
          multiline
          rows={3}
          name="description"
          label="Description (optional)"
          value={form.description}
          onChange={handleChange}
          inputProps={{ dir: "ltr" }}
        />
      </Grid2>

      <Grid2 xs={12}>
        <Box display="flex" justifyContent="center">
          <Button variant="outlined" color="primary" onClick={handleSubmit}>
            Add Partner
          </Button>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default CreateIntegration;
