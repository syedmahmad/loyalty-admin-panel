"use client";

import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Button, Box, Switch, FormControlLabel } from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { integrationService } from "@/services/integrationService";
import { toast } from "react-toastify";
import * as yup from "yup";
import type { GlobalIntegration } from "@/types/integration.types";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  description: yup.string(),
});

interface Props {
  item: GlobalIntegration;
  reFetch: () => void;
  onClose: () => void;
}

const EditIntegration = ({ item, reFetch, onClose }: Props) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: item.name,
    description: item.description ?? "",
    isActive: item.isActive,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await schema.validate(form, { abortEarly: false });
      setFormErrors({});

      await integrationService.update(item.id, {
        name: form.name,
        description: form.description || undefined,
        isActive: form.isActive,
      });

      toast.success("Partner updated successfully");
      reFetch();
      onClose();
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const errors: Record<string, string> = {};
        err.inner.forEach((e: any) => { errors[e.path] = e.message; });
        setFormErrors(errors);
      } else {
        toast.error(err?.response?.data?.message || "Failed to update partner");
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
        <FormControlLabel
          control={
            <Switch
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              color="primary"
            />
          }
          label="Active"
        />
      </Grid2>

      <Grid2 xs={12}>
        <Box display="flex" justifyContent="center">
          <Button variant="outlined" color="primary" onClick={handleSubmit}>
            Update Partner
          </Button>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default EditIntegration;
