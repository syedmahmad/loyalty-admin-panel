"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";

const PROGRAM_TYPES = [
  { value: "points", label: "Points" },
  { value: "otp", label: "OTP (e.g. Qitaf)" },
];

import { useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import { GET, POST, PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

const fetchBusinessUnits = async () => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const response = await GET(`/business-units/${clientInfo.id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

const fetchBusinessUnitById = async (id: string) => {
  const response = await GET(`/business-units/single/${id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business unit");
  }
  return response.data;
};

const updateBusinessUnit = async (id: string, payload: any) => {
  const response = await PUT(`/business-units/${id}`, payload);
  if (response?.status !== 200) {
    throw new Error("Failed to update business unit");
  }
  return response.data;
};

const BusinessUnitEditForm = ({ onSuccess }: any) => {
  const params = useSearchParams();
  const paramId = params.get("id") || null;
  const [businessUnits, setBusinessUnits] = useState<{ id: number; name: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(paramId ?? null);
  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    location: "",
    type: "points",
    status: 1,
    redemption_enabled: 1,
  });
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapDataToValues = (data: any) => ({
    name: data.name || "",
    description: data.description || "",
    location: data.location || "",
    type: data.type || "points",
    status: data.status ?? 1,
    redemption_enabled: data.redemption_enabled ?? 1,
  });

  useEffect(() => {
    if (!paramId) {
      fetchBusinessUnits().then(setBusinessUnits);
    } else {
      setLoading(true);
      fetchBusinessUnitById(paramId)
        .then((data) => {
          setInitialValues(mapDataToValues(data));
          setIconUrl(data.icon ?? null);
        })
        .finally(() => setLoading(false));
    }
  }, [paramId]);

  useEffect(() => {
    if (selectedId) {
      setLoading(true);
      fetchBusinessUnitById(selectedId)
        .then((data) => {
          setInitialValues(mapDataToValues(data));
          setIconUrl(data.icon ?? null);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedId]);

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

  const handleSubmit = async (values: any) => {
    if (!selectedId) return alert("No Business Unit selected.");
    setLoading(true);
    try {
      await updateBusinessUnit(selectedId, { ...values, icon: iconUrl ?? null });
      fetchBusinessUnits().then(setBusinessUnits);
      fetchBusinessUnitById(selectedId).then((data) => {
        setInitialValues(mapDataToValues(data));
        setIconUrl(data.icon ?? null);
      });
      toast.success("Business Unit updated!");
      onSuccess();
    } catch (e) {
      console.log("Something went wrong", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!paramId && (
        <Grid container spacing={2} sx={{ mb: 1, width: "100%" }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Business Unit"
              value={selectedId || ""}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {businessUnits.map((bu) => (
                <MenuItem key={bu.id} value={bu.id}>
                  {bu.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}
      <br />
      {selectedId && !loading ? (
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={Yup.object().shape({
            name: Yup.string().required("Name is required"),
            description: Yup.string(),
            location: Yup.string(),
            type: Yup.string().required("Program type is required"),
          })}
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
                    value={values.type ?? "points"}
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
                        checked={values.status === 1}
                        onChange={(e) =>
                          setFieldValue("status", e.target.checked ? 1 : 0)
                        }
                        color="primary"
                      />
                    }
                    label={values.status === 1 ? "Business Unit Enabled" : "Business Unit Disabled"}
                  />
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
                    label={values.redemption_enabled === 1 ? "Redemption Enabled" : "Redemption Disabled"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Program Icon
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={iconUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {iconUploading ? <CircularProgress size={18} /> : iconUrl ? "Replace Icon" : "Upload Icon"}
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
                      {loading ? <CircularProgress size={24} /> : "Update"}
                    </Button>
                  </Box>
                </Grid>

                <br />
                <br />
              </Grid>
            </Form>
          )}
        </Formik>
      ) : selectedId && loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : null}
    </>
  );
};

export default BusinessUnitEditForm;
