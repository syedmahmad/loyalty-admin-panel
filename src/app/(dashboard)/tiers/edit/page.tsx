'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Formik, Form } from 'formik';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { GET, PUT } from '@/utils/AxiosUtility';
import { RichTextEditor } from '@/components/TextEditor';


type Tier = {
  id: number;
  name: string;
};

type BusinessUnit = {
  id: number;
  name: string;
};

const EditTierForm =  ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');
  const theme = useTheme();
  // const [rules, setRules] = useState<any[]>([]);
  // const [selectedRules, setSelectedRules] = useState<number[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedId, setSelectedId] = useState<string>(paramId || '');
  const [tierData, setTierData] = useState<any>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [benefits, setBenefits] = useState<string>('');

  // const fetchRules = async () => {
  //   const res = await GET('/rules');
  //   if (res?.data) {
  //     setRules(res.data);
  //   }
  // };

  const userId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('client-info') || '{}')?.id ?? 0
      : 0;

  useEffect(() => {
    const resolveAllPromises = async () => {
      const fetchTiersAndBUs = async () => {
        const [tierListRes, buRes] = await Promise.all([
          GET(`/tiers/${userId}`),
          GET(`/business-units/${userId}`),
        ]);
        setTiers(tierListRes?.data.tiers || []);
        setBusinessUnits(buRes?.data || []);

        if (paramId) {
          await fetchTierById(paramId);
        }

        setInitializing(false);
      };

      await Promise.all([fetchTiersAndBUs()]);
    }

    resolveAllPromises();
  }, [paramId]);

  const fetchTierById = async (id: string) => {
    setLoading(true);
    const res = await GET(`/tiers/single/${id}`);
    if (!res?.data) {
      toast.error('Tier not found');
      return;
    }

    setSelectedId(id);
    setTierData({
      name: res.data.name,
      min_points: res.data.min_points,
      // points_conversion_rate: res.data.points_conversion_rate,
      benefits: res.data.benefits || '',
      business_unit_id: res.data.business_unit_id.toString(),
    });
    setBenefits(res.data.benefits || '');
    // setSelectedRules((res.data.rule_targets || []).map((t: any) => t.rule_id));
    setLoading(false);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Tier name is required'),
    min_points: Yup.number().required('Minimum points required'),
    //  conversion_rate: Yup.number()
    //       .required('Conversion rate is required')
    //       .min(0, 'Conversion rate must be a positive number'),
    business_unit_id: Yup.string().required('Business unit is required'),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      benefits: benefits || '',
      business_unit_id: values.business_unit_id,
      min_points: +values.min_points,
      // points_conversion_rate: +values.conversion_rate,
      updated_by: userId,
      // rule_targets: selectedRules.map((rule_id) => ({ rule_id })),
    };

     const res = await PUT(`/tiers/${selectedId}`, payload);
    if (res?.status !== 200) {
      toast.error('Failed to update tier');
    } else {
      toast.success('Tier updated!');
      onSuccess();
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
    <>
      {/* <Tooltip title="Go Back">
        <IconButton onClick={() => router.back()} sx={{ width: 120, color: theme.palette.primary.main }}>
          <ArrowBackIcon /> &nbsp; Go Back
        </IconButton>
      </Tooltip>
      <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ✏ Edit Tier
        </Typography> */}

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

                  {/* <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="points_conversion_rate"
                      label="Points Conversion Rate"
                      value={values.points_conversion_rate}
                      onChange={handleChange}
                      error={!!touched.points_conversion_rate && !!errors.points_conversion_rate}
                      helperText={touched.points_conversion_rate && typeof errors.points_conversion_rate === 'string' ? errors.points_conversion_rate : undefined}
                    />
                  </Grid> */}

                  <Grid item xs={12}>
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

                  {/* <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Attach Rules"
                      SelectProps={{ multiple: true }}
                      value={selectedRules}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedRules(Array.isArray(value) ? value : []);
                      }}
                    >
                      {rules.map((rule) => (
                        <MenuItem key={rule.id} value={rule.id}>
                          {`${rule.name.toUpperCase()} — ${rule.rule_type} ${rule.max_points_limit}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid> */}

                  <Grid item xs={12}>
                    {/* <TextField
                      fullWidth
                      name="benefits"
                      label="Benefits"
                      multiline
                      minRows={3}
                      value={values.benefits}
                      onChange={handleChange}
                    /> */}
                    <Typography variant="subtitle1" gutterBottom>
                      Benefits (optional)
                    </Typography>
                    <RichTextEditor value={benefits} setValue={setBenefits} language="en" />
                  </Grid>

                  <Grid item xs={12}>
                     <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      type="submit"
                      variant="outlined"
                      disabled={loading}
                      sx={{ textTransform: 'none', borderRadius: 2,fontWeight:600 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Tier'}
                    </Button>
                    </Box>

                    <br />
                    <br />
                    
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        )}
      
    </>
  );
};

export default EditTierForm;
