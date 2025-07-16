'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { POST } from '@/utils/AxiosUtility';

const CreateCustomerSegment = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clientInfo = localStorage.getItem('client-info');
      const parsed = JSON.parse(clientInfo!);
      const res = await POST('/customer-segments', {
        name,
        description,
        tenant_id: parsed.id, // Replace with actual tenant ID logic
      });

      if (res?.status === 201 || res?.status === 200) {
        router.push('/customer-segment'); // Redirect to segment listing
      } else {
        setError('Failed to create segment');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={3}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Create Customer Segment
      </Typography>
      <Card>
        <CardContent>
          <TextField
            label="Segment Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => router.push('/segments')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateCustomerSegment;
