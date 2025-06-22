'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { GET, PUT } from '@/utils/AxiosUtility';

type Tier = {
  id: number;
  name: string;
};

type BusinessUnit = {
  id: number;
  name: string;
};

const EditTierForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedId, setSelectedId] = useState<string>(paramId || '');
  const [tierData, setTierData] = useState<any>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const userId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('client-info') || '{}')?.id ?? 0
      : 0;

  useEffect(() => {
    const fetchTiersAndBUs = async () => {
      const [tierListRes, buRes] = await Promise.all([
        GET('/tiers'),
        GET('/business-units'),
      ]);
      setTiers(tierListRes?.data || []);
      setBusinessUnits(buRes?.data || []);

      if (paramId) {
        await fetchTierById(paramId);
      }

      setInitializing(false);
    };

    fetchTiersAndBUs();
  }, [paramId]);

  const fetchTierById = async (id: string) => {
    setLoading(true);
    const res = await GET(`/tiers/${id}`);
    if (!res?.data) {
      toast.error('Tier not found');
      return;
    }

    setSelectedId(id);
    setTierData({
      name: res.data.name,
      min_points: res.data.min_points,
      max_points: res.data.max_points,
      benefits: res.data.benefits || '',
      business_unit_id: res.data.business_unit_id.toString(),
    });
    setLoading(false);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Tier name is required'),
    min_points: Yup.number().required('Minimum points required'),
    max_points: Yup.number().required('Maximum points required'),
    business_unit_id: Yup.string().required('Business unit is required'),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      min_points: +values.min_points,
      max_points: +values.max_points,
      updated_by: userId,
    };

    const res = await PUT(`/tiers/${selectedId}`, payload);
    if (res?.status !== 200) {
      toast.error('Failed to update tier');
    } else {
      toast.success('Tier updated!');
      router.push('/tiers/view');
    }
    setLoading(false);
  };

  if (initializing) {
    return (
      <Box mt={6} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ✏ Edit Tier
        </Typography>

        {!selectedId && (
          <Grid container spacing={2} sx={{ mb: 1, width: '100%' }}>
            <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Tier"
              value={selectedId}
              onChange={(e) => fetchTierById(e.target.value)}
              margin="normal"
            >
              {tiers.map((tier) => (
                <MenuItem key={tier.id} value={tier.id}>
                  {tier.name}
                </MenuItem>
              ))}
            </TextField>
            </Grid>
          </Grid>
        )}

        {tierData && (
          <Formik
            enableReinitialize
            initialValues={tierData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange }) => (
              <Form noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Tier Name"
                      value={values.name}
                      onChange={handleChange}
                      error={!!touched.name && !!errors.name}
                      helperText={touched.name && typeof errors.name === 'string' ? errors.name : undefined}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="min_points"
                      label="Min Points"
                      type="number"
                      value={values.min_points}
                      onChange={handleChange}
                      error={!!touched.min_points && !!errors.min_points}
                      helperText={touched.name && typeof errors.name === 'string' ? errors.name : undefined}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="max_points"
                      label="Max Points"
                      type="number"
                      value={values.max_points}
                      onChange={handleChange}
                      error={!!touched.max_points && !!errors.max_points}
                      helperText={touched.name && typeof errors.name === 'string' ? errors.name : undefined}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      name="business_unit_id"
                      label="Business Unit"
                      value={values.business_unit_id}
                      onChange={handleChange}
                      error={!!touched.business_unit_id && !!errors.business_unit_id}
                      helperText={touched.name && typeof errors.name === 'string' ? errors.name : undefined}
                    >
                      {businessUnits.map((bu) => (
                        <MenuItem key={bu.id} value={bu.id}>
                          {bu.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="benefits"
                      label="Benefits"
                      multiline
                      minRows={3}
                      value={values.benefits}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Tier'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        )}
      </CardContent>
    </Card>
  );
};

export default EditTierForm;
