'use client';

import {
  Box,
  Button,
  Grid,
  InputLabel,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

const CreateCustomerSegment = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const InfoLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <Box display="flex" alignItems="center" mb={0.5}>
      <InputLabel sx={{ mr: 0.5 }}>{label}</InputLabel>
      {/* Tooltip could be added here if needed */}
    </Box>
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clientInfo = localStorage.getItem('client-info');
      if (!clientInfo) throw new Error('Client info not found in localStorage.');

      const parsed = JSON.parse(clientInfo);
      const payload = {
        name,
        description,
        tenant_id: parsed.id,
      };

      console.log('Creating customer segment with payload:', payload);

      const res = await POST('/customer-segments', payload);

      if (res?.status === 201 || res?.status === 200) {
        toast.success('Customer segment created successfully!');
        setSubmitted(true);
        onSuccess?.();
        router.push('/customer-segment');
      } else {
        setError('Failed to create customer segment');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err?.response?.data?.message || err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <InfoLabel
            label="Segment Name"
            tooltip="Give your customer segment a meaningful name."
          />
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading || submitted}
          />
        </Grid>

        <Grid item xs={12}>
          <InfoLabel
            label="Description"
            tooltip="Optional: Describe what defines this segment."
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || submitted}
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}
      </Grid>

      <Grid item xs={12}>
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || submitted}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 550 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </Box>
      </Grid>
    </>
  );
};

export default CreateCustomerSegment;
