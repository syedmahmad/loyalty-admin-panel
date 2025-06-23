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

const RuleCreateForm = () => {
  const router = useRouter();
  const userInfo = JSON.parse(localStorage.getItem('client-info') || '{}');
  const created_by = userInfo?.id;

  const [form, setForm] = useState({
    type: 'earn',
    condition_type: 'total_spending',
    operator: '=',
    value: '',
    reward_value: '',
    unit_type: '',
    description: '',
    target_type: '',
    target_id: '',
  });

  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTargets = async () => {
    if (form.target_type === 'tier') {
      const res = await GET('/tiers');
      setTargets(res?.data || []);
    } else if (form.target_type === 'campaign') {
      const res = await GET('/campaigns');
      setTargets(res?.data || []);
    } else {
      setTargets([]);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [form.target_type]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.condition_type ||
      !form.operator ||
      !form.value ||
      !form.target_type ||
      !form.target_id
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
      reward_value: form.reward_value ? parseFloat(form.reward_value) : null,
      unit_type: form.unit_type || null,
      description: form.description || null,
      created_by,
      updated_by: created_by, // handled in backend or frontend depending on design
      tenant_id: created_by, // if your logic expects this
      targets: [
        {
          target_type: form.target_type,
          target_id: parseInt(form.target_id),
        },
      ],
    };
    
  
    const response = await POST('/rules', payload);
  
    if (response?.status === 201) {
      toast.success('Rule created successfully!');
      // router.push('/rules/view');
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
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            select
            label="Target Type"
            fullWidth
            value={form.target_type}
            onChange={(e) => handleChange('target_type', e.target.value)}
          >
            <MenuItem value="tier">Tier</MenuItem>
            <MenuItem value="campaign">Campaign</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={6}>
          <TextField
            select
            label={`Select ${form.target_type || 'Target'}`}
            fullWidth
            value={form.target_id}
            onChange={(e) => handleChange('target_id', e.target.value)}
            disabled={!form.target_type}
          >
            {targets.map((target: any) => (
              <MenuItem key={target.id} value={target.id}>
                {target.name}
              </MenuItem>
            ))}
          </TextField>
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
