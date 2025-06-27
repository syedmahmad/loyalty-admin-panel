'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import { GET, PUT } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

const fetchBusinessUnits = async () => {
  const response = await GET('/business-units');
  if (response?.status !== 200) {
    throw new Error('Failed to fetch business units');
  }
  return response.data;
};

const fetchBusinessUnitById = async (id: string) => {
  const response = await GET(`/business-units/${id}`);
  if (response?.status !== 200) {
    throw new Error('Failed to fetch business units');
  }
  return response.data;
};

const updateBusinessUnit = async (id: string, payload: any) => {
  const response = await PUT(`/business-units/${id}`, payload);
  if (response?.status !== 200) {
    throw new Error('Failed to update business unit');
  }
  return response.data;
};

const BusinessUnitEditForm = () => {
  const params = useSearchParams();
  const paramId =  params.get('id') || null;
  const router = useRouter();
  const [businessUnits, setBusinessUnits] = useState<{ id: number; name: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(paramId ?? null);
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paramId) {
      fetchBusinessUnits().then(setBusinessUnits);
    } else {
      setLoading(true);
      fetchBusinessUnitById(paramId)
        .then((data) => {
          setInitialValues({
            name: data.name || '',
            description: data.description || '',
            location: data.location || '',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [paramId]);

  useEffect(() => {
    if (selectedId) {
      setLoading(true);
      fetchBusinessUnitById(selectedId)
        .then((data) => {
          setInitialValues({
            name: data.name || '',
            description: data.description || '',
            location: data.location || '',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [selectedId]);

  const handleSubmit = async (values: any) => {
    if (!selectedId) return alert('No Business Unit selected.');
    setLoading(true);
    try {
      await updateBusinessUnit(selectedId, values);
      fetchBusinessUnits().then(setBusinessUnits);
      if (selectedId) {
        setLoading(true);
        fetchBusinessUnitById(selectedId)
          .then((data) => {
            setInitialValues({
              name: data.name || '',
              description: data.description || '',
              location: data.location || '',
            });
          })
          .finally(() => setLoading(false));
      }
      toast.success('Business Unit updated!');
      router.push('/business-units/view');
    } catch (e) {
      console.log('Something went wrong', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 1, borderRadius: 4, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          ✏️ Edit Business Unit
        </Typography>

        {!paramId && (
          <Grid container spacing={2} sx={{ mb: 1, width: '100%' }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Business Unit"
              value={selectedId || ''}
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
              name: Yup.string().required('Name is required'),
              description: Yup.string(),
              location: Yup.string(),
            })}
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
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading}
                      fullWidth
                      size="large"
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Business Unit'}
                    </Button>
                    <br />
                    <br />
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      onClick={() => router.push('view')}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      Go Back
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        ) : selectedId && loading ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default BusinessUnitEditForm;
