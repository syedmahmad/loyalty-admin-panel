'use client';

import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { GET, POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import { RichTextEditor } from '@/components/TextEditor';
import { useRouter } from 'next/navigation';

type BusinessUnit = {
  id: number;
  name: string;
};

const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const response = await GET('/business-units');
  if (response?.status !== 200) {
    throw new Error('Failed to fetch business units');
  }
  return response.data;
};

// const fetchRules = async (): Promise<any[]> => {
//   const response = await GET('/rules');
//   if (response?.status !== 200) {
//     throw new Error('Failed to fetch rules');
//   }
//   return response.data;
// };

const CreateTierForm = () => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [benefits, setBenefits] = useState<string>('');
  // const [rules, setRules] = useState<any[]>([]);
  // const [selectedRules, setSelectedRules] = useState<number[]>([]);

  const router = useRouter();

  const created_by = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('client-info') || '{}')?.id ?? 0
    : 0;

  const loadData = async () => {
      setLoading(true);
      try {
        const [buData] = await Promise.all([
          fetchBusinessUnits(),
          // fetchRules(),
        ]);
        setBusinessUnits(buData);
        // setRules(ruleData);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      loadData();
    }, []);

  const initialValues = {
    name: '',
    min_points: '',
    benefits: '',
    business_unit_ids: [] as number[],
    // conversion_rate: 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Tier name is required'),
    min_points: Yup.number().required('Minimum points required'),
    // conversion_rate: Yup.number()
    //   .required('Conversion rate is required')
    //   .min(0, 'Conversion rate must be a positive number'),
    business_unit_ids: Yup.array()
      .min(1, 'At least one business unit is required')
      .of(Yup.number().required()),
  });

  const handleSubmit = async (values: typeof initialValues, resetForm: () => void) => {
    setLoading(true);
    const payloads = values.business_unit_ids.map((buId) => ({
      name: values.name,
      min_points: +values.min_points,
      benefits: benefits || '',
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
    }));

    const responses = await Promise.all(
      payloads.map((payload) => POST('/tiers', payload))
    );

    const anyFailed = responses.some((res) => res?.status !== 201);

    if (anyFailed) {
      setLoading(false);
      toast.error('Some tiers failed to create');
    } else {
      toast.success('All tiers created successfully!');
      resetForm();
      setBenefits('');
      setLoading(false);
      router.push('/tiers/view');
    }
  };

  return (
    <Card sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ➕ Create New Tier
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
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
                    helperText={touched.name && errors.name}
                  />
                </Grid>

                {/* <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="conversion_rate"
                    label="Points Conversion Rate"
                    type="number"
                    value={values.conversion_rate || ''}
                    onChange={handleChange}
                    error={!!touched.conversion_rate && !!errors.conversion_rate}
                    helperText={touched.conversion_rate && errors.conversion_rate}
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
                    helperText={touched.min_points && errors.min_points}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    name="business_unit_ids"
                    label="Business Units"
                    SelectProps={{ multiple: true }}
                    value={values.business_unit_ids}
                    onChange={handleChange}
                    error={!!touched.business_unit_ids && !!errors.business_unit_ids}
                    helperText={touched.business_unit_ids && errors.business_unit_ids}
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
                    name="rule_targets"
                    label="Attach Rules"
                    SelectProps={{ multiple: true }}
                    value={selectedRules}
                    onChange={(e) => {
                      setSelectedRules(
                        typeof e.target.value === 'string'
                          ? e.target.value.split(',').map(Number)
                          : e.target.value
                      )
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
                    label="Benefits (optional)"
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
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create Tier'}
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
      </CardContent>
    </Card>
  );
};

export default CreateTierForm;
