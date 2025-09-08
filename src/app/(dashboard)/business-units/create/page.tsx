"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Tooltip,
  IconButton,
  useTheme,
  Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const BusinessUnitSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  location: Yup.string(),
});

const BusinessUnitCreateForm = ({ onSuccess } : any) => {
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
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

  const handleSubmit = async (values: any, { resetForm }: any) => {
    if (!tenantId) return alert("Tenant ID not found in localStorage.");

    setLoading(true);
    try {
      const payload = {
        ...values,
        tenant_id: tenantId,
      };

      // 🔁 Replace with actual API call
      const response = await POST("/business-units", payload);
      console.log("Creating business unit with payload:", payload, response);

      if (response?.status !== 201) {
        throw new Error("Failed to create business unit");
      } else {
        resetForm();
        toast.success("Business Unit created successfully!");
        onSuccess(); // router.push('/business-units/view');
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
      {/* <Tooltip title="Go Back">
        <IconButton onClick={() => router.back()} sx={{ width: 120, color: theme.palette.primary.main }}>
          <ArrowBackIcon /> &nbsp; Go Back
        </IconButton>
      </Tooltip> */}
      <Formik
        initialValues={{
          name: "",
          description: "",
          location: "",
        }}
        validationSchema={BusinessUnitSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange }) => (
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
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 550,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Create business"
                    )}
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
