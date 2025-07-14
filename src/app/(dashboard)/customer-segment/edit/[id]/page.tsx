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
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import { useParams } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { GET, POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

const fetchSegment = async (id: any) => {
  const response = await GET(`/customer-segments/view-customers/${id}`);
  if (response?.status !== 200) {
    throw new Error('Failed to fetch segment');
  }
  return response.data;
};

const fetchAllCustomers = async (tenantId: number) => {
  const response = await GET(`/customers/${tenantId}`);
  if (response?.status !== 200) {
    throw new Error('Failed to fetch customers');
  }
  return response.data;
};

const addCustomerToSegment = async (segmentId: number, customerId: number, userSecret: string) => {
  return await POST(
    `/customer-segments/add-customer/${segmentId}`,
    { customer_id: customerId },
    userSecret
  );
};

const removeCustomerFromSegment = async (segmentId: number, customerId: number, userSecret: string) => {
  return await POST(
    `/customer-segments/remove-customer/${segmentId}`,
    { customer_id: customerId },
    userSecret
  );
};

const CustomerSegmentEditPage = () => {
  const { id: segmentId } = useParams();
  const [segment, setSegment] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userSecret, setUserSecret] = useState<string>('');

  useEffect(() => {
    const secret = localStorage.getItem('user-secret');
    if (secret) setUserSecret(secret);
  }, []);

  useEffect(() => {
    if (!segmentId) return;
    setLoading(true);
    const fetchData = async () => {
      const segment = await fetchSegment(segmentId);
      const clientInfo = localStorage.getItem('client-info');
      const parsed = JSON.parse(clientInfo!);
      const tenantId = parsed?.id || 1;
      const allCustomers = await fetchAllCustomers(tenantId);
      setSegment(segment);
      setCustomers(allCustomers);
      setLoading(false);
    };
    fetchData();
  }, [segmentId]);

  const handleAddCustomer = async () => {
    if (!selectedCustomerId || !segmentId || !userSecret) return;
    await addCustomerToSegment(+segmentId, +selectedCustomerId, userSecret);
    const updated = await fetchSegment(segmentId);
    setSegment(updated);
    setSelectedCustomerId('');
    toast.success('Customer added to segment');
  };

  const handleRemoveCustomer = async (customerId: number) => {
    if (!segmentId || !userSecret) return;
    await removeCustomerFromSegment(+segmentId, customerId, userSecret);
    const updated = await fetchSegment(segmentId);
    setSegment(updated);
    toast.success('Customer removed from segment');
  };

  if (loading || !segment) return <CircularProgress />;

  const segmentCustomers = segment.members?.map((m: any) => m.customer) || [];

  return (
    <Card sx={{ width: 700, mx: 'auto', mt: 4, p: 2, borderRadius: 4, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          ✏️ Edit Customer Segment
        </Typography>

        <Formik
          enableReinitialize
          initialValues={{
            name: segment.name || '',
            description: segment.description || '',
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            description: Yup.string(),
          })}
          onSubmit={() => {}}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Segment Name"
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && typeof errors.name === 'string' ? errors.name : undefined}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <GroupIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    disabled
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
                    helperText={touched.description && typeof errors.description === 'string' ? errors.description : undefined}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Add Customer"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    {customers.length > 0 && customers
                      .filter((c) => !segmentCustomers.some((sc: any) => sc.id === c.id))
                      .map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleAddCustomer}
                    disabled={!selectedCustomerId}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>

        <Box mt={4}>
          <Typography variant="h6">Segment Customers</Typography>
          <List>
            {segmentCustomers.map((c: any) => (
              <ListItem
                key={c.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveCustomer(c.id)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={c.name} secondary={`${c.email} | ${c.phone}`} />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomerSegmentEditPage;
