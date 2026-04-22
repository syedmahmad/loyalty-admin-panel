"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  InputAdornment,
  Box,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

const PROGRAM_TYPES = [
  { value: "points", label: "Points" },
  { value: "otp", label: "OTP (e.g. Qitaf)" },
];

const BusinessUnitSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  location: Yup.string(),
  type: Yup.string().required("Program type is required"),
});

const BusinessUnitCreateForm = ({ onSuccess }: any) => {
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const clientInfo = localStorage.getItem("client-info");
    if (clientInfo) {
      try {
        const parsed = JSON.parse(clientInfo);
        if (parsed?.id) setTenantId(parsed.id);
      } catch (error) {
        console.error("Invalid client-info in localStorage", error);
      }
    }
  }, []);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["jpg", "jpeg", "png", "avif"].includes(ext)) {
      toast.error("Please upload a valid image file (JPG or PNG)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIconUploading(true);
    try {
      const res = await POST("/business-units/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data?.success) {
        setIconUrl(res.data.uploaded_url);
        toast.success("Icon uploaded");
      } else {
        toast.error("Icon upload failed");
      }
    } catch {
      toast.error("Icon upload failed");
    } finally {
      setIconUploading(false);
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    if (!tenantId) return alert("Tenant ID not found in localStorage.");

    setLoading(true);
    try {
      const payload = {
        ...values,
        tenant_id: tenantId,
        icon: iconUrl ?? null,
      };

      const response = await POST("/business-units", payload);

      if (response?.status !== 201) {
        throw new Error("Failed to create business unit");
      } else {
        resetForm();
        setIconUrl(null);
        toast.success("Business Unit created successfully!");
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!tenantId) {
    return (
      <Typography variant="body1" color="error">
        Missing tenant ID in localStorage. Please log in again.
      </Typography>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          name: "",
          description: "",
          location: "",
          type: "points",
          redemption_enabled: 1,
        }}
        validationSchema={BusinessUnitSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, setFieldValue }) => (
          <Form noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Business Unit Name"
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={values.description}
                  onChange={handleChange}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="location"
                  label="Location"
                  value={values.location}
                  onChange={handleChange}
                  error={touched.location && Boolean(errors.location)}
                  helperText={touched.location && errors.location}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  name="type"
                  label="Program Type"
                  value={values.type}
                  onChange={handleChange}
                  error={touched.type && Boolean(errors.type)}
                  helperText={touched.type && errors.type}
                >
                  {PROGRAM_TYPES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.redemption_enabled === 1}
                      onChange={(e) =>
                        setFieldValue("redemption_enabled", e.target.checked ? 1 : 0)
                      }
                      color="primary"
                    />
                  }
                  label={
                    values.redemption_enabled === 1
                      ? "Redemption Enabled"
                      : "Redemption Disabled"
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Program Icon (optional)
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={iconUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {iconUploading ? <CircularProgress size={18} /> : "Upload Icon"}
                  </Button>
                  {iconUrl && (
                    <Box
                      component="img"
                      src={iconUrl}
                      alt="icon preview"
                      sx={{ width: 48, height: 48, objectFit: "contain", borderRadius: 1, border: "1px solid #ddd" }}
                    />
                  )}
                  {iconUrl && (
                    <Button size="small" color="error" onClick={() => setIconUrl(null)}>
                      Remove
                    </Button>
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/avif"
                  style={{ display: "none" }}
                  onChange={handleIconUpload}
                />
              </Grid>

              <Grid item xs={12}>
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    type="submit"
                    disabled={loading || iconUploading}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 550 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Create business"}
                  </Button>
                </Box>
              </Grid>

              <br />
              <br />
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default BusinessUnitCreateForm;
