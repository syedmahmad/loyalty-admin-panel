'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  InputLabel,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';




  const CreateCustomerSegment = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const InfoLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Box display="flex" alignItems="center" mb={0.5}>
    <InputLabel sx={{ mr: 0.5 }}>{label}</InputLabel>
   
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
    const parsed = JSON.parse(clientInfo);
    const payload = {
      name,
      description,
      tenant_id: parsed.id, // Replace with correct logic if needed
    };

    const res = await POST('/customer-segments', payload);
    console.log('Creating customer segment with payload:', payload, res);

    if (res?.status !== 201 && res?.status !== 200) {
      throw new Error('Failed to create customer segment');
    }
  };

    toast.success('Customer segment created successfully!');
    onSuccess?.(); // Optional chaining in case it's not passed
  } catch (err: any) {
    console.error('Error:', err);
    setError(err?.response?.data?.message || err.message || 'Unexpected error occurred');
  } finally {
    setLoading(false);
  }
};


  return (<>
  
   
    
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
        disabled={loading}
        sx={{ borderRadius: 2, textTransform: 'none',fontWeight:550 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create'}
      </Button>
    </Box>
  </Grid>
</>

  );
};

export default CreateCustomerSegment;