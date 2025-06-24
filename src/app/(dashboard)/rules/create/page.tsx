'use client';

import {
  Box,
  Button,
  Card,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
  Grid
} from '@mui/material';
import { useEffect, useState } from 'react';
import { POST, GET } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/TextEditor';

const RuleCreateForm = () => {
  const router = useRouter();
  const userInfo = JSON.parse(localStorage.getItem('client-info') || '{}');
  const created_by = userInfo?.id;

  const initialForm = {
    type: 'earn',
    condition_type: 'total_spending',
    operator: '=',
    value: '',
    reward_value: '',
    unit_type: '',
    description: '',
  }

  const [form, setForm] = useState(initialForm);

  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.condition_type ||
      !form.operator ||
      !form.value
    ) {
      toast.error('Please fill all required fields');
      return;
    }
  
    setLoading(true);
  
    const payload = {
      type: form.type,
      condition_type: form.condition_type,
      operator: form.operator,
      value: parseFloat(form.value),
      reward_value: form.reward_value ? parseFloat(form.reward_value) : '',
      unit_type: form.unit_type || '',
      description: description || '',
      created_by,
      updated_by: created_by, // handled in backend or frontend depending on design
      tenant_id: created_by, // if your logic expects this
    };
    
  
    const response = await POST('/rules', payload);
  
    if (response?.status === 201) {
      toast.success('Rule created successfully!');
      setForm(initialForm); // Reset form after successful creation
      setDescription(''); // Reset description
      router.push('/rules/view');
    } else {
      toast.error('Failed to create rule');
    }
  
    setLoading(false);
  };
  

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        ➕ Create Rule
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Define Rule Type"
            fullWidth
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
          </TextField>
        </Grid>

        <Grid item xs={6}>
        <TextField
          label="Define Condition Type"
          fullWidth
          value={form.condition_type}
          onChange={(e) => handleChange('condition_type', e.target.value)}
        >
        </TextField>
        </Grid>

        <Grid item xs={6}>
          <TextField
            select
            label="Operator"
            fullWidth
            value={form.operator}
            onChange={(e) => handleChange('operator', e.target.value)}
          >
            <MenuItem value="=">=</MenuItem>
            <MenuItem value="!=">≠</MenuItem>
            <MenuItem value=">">&gt;</MenuItem>
            <MenuItem value=">=">&ge;</MenuItem>
            <MenuItem value="<">&lt;</MenuItem>
            <MenuItem value="<=">&le;</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Value"
            fullWidth
            type="number"
            value={form.value}
            onChange={(e) => handleChange('value', e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Reward Value (optional)"
            fullWidth
            type="number"
            value={form.reward_value}
            onChange={(e) => handleChange('reward_value', e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Unit Type (e.g. points)"
            fullWidth
            value={form.unit_type}
            onChange={(e) => handleChange('unit_type', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          {/* <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          /> */}
          <Typography variant="subtitle1" gutterBottom>
            Description (optional)
          </Typography>
          <RichTextEditor value={description} setValue={setDescription} language="en" />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Rule'}
        </Button>
      </Box>

    </Card>
  );
};

export default RuleCreateForm;
