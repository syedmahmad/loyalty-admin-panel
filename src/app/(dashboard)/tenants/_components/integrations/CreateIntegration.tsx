"use client";

import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Button, Box } from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { integrationService } from "@/services/integrationService";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  description: yup.string(),
});

interface Props {
  reFetch: () => void;
}

const CreateIntegration = ({ reFetch }: Props) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", description: "" });

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
        description: form.description || undefined,
        isActive: true,
      });

      toast.success("Partner added successfully");
      reFetch();
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const errors: Record<string, string> = {};
        err.inner.forEach((e: any) => { errors[e.path] = e.message; });
        setFormErrors(errors);
      } else {
        toast.error(err?.response?.data?.message || "Failed to create partner");
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
