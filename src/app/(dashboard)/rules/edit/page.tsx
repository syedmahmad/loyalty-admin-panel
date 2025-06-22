'use client';

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GET, PUT } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

const initialState = {
  type: '',
  condition_type: '',
  operator: '',
  value: '',
  reward_value: '',
  unit_type: '',
  description: '',
  target_type: '',
  target_id: '',
  id: '',
};

const RuleEdit = () => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');
  const [form, setForm] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(paramId || '');
  const router = useRouter();

  const clientInfo = JSON.parse(localStorage.getItem('client-info') || '{}');
  const created_by = clientInfo.id;

  const fetchAllRules = async () => {
    const res = await GET('/rules');
    setRules(res?.data || []);
  };

  const loadRuleDetails = async (ruleId: string) => {
    setLoading(true);
    const res = await GET(`/rules/${ruleId}`);
    const rule = res?.data;

    if (rule) {
      const target = rule.targets?.[0] || {};
      setForm({
        ...rule,
        value: rule.value.toString(),
        reward_value: rule.reward_value?.toString() || '',
        target_type: target.target_type || '',
        target_id: target.target_id?.toString() || '',
        id: target.id,
      });

      if (target.target_type === 'tier') {
        const res = await GET('/tiers');
        setTargets(res?.data || []);
      } else if (target.target_type === 'campaign') {
        const res = await GET('/campaigns');
        setTargets(res?.data || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paramId) {
      setSelectedId(paramId);
      loadRuleDetails(paramId);
    } else {
      fetchAllRules();
    }
  }, [paramId]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));

    if (field === 'target_type') {
      setForm((prev: any) => ({ ...prev, target_id: '' }));

      GET(`/${value === 'tier' ? 'tiers' : 'campaigns'}`).then((res) => {
        setTargets(res?.data || []);
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedId) return toast.error('No rule selected');

    const payload = {
      type: form.type,
      condition_type: form.condition_type,
      operator: form.operator,
      value: parseFloat(form.value),
      reward_value: form.reward_value ? parseFloat(form.reward_value) : '',
      unit_type: form.unit_type || '',
      description: form.description || '',
      created_by,
      updated_by: created_by,
      tenant_id: created_by,
      targets: [
        {
          id: form.id || undefined,
          target_type: form.target_type,
          target_id: parseInt(form.target_id),
        },
      ],
    };

    setLoading(true);
    const res = await PUT(`/rules/${selectedId}`, payload);

    if (res?.status === 200) {
      toast.success('Rule updated successfully!');
      router.push('/rules/view');
    } else {
      toast.error('Failed to update rule');
    }
    setLoading(false);
  };

  return (
    <Card sx={{ p: 4, width: 600, mx: 'auto', mt: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        ✏️ Edit Rule
      </Typography>

      {!paramId && (
        <Grid container spacing={2} sx={{ mb: 1, width: '100%' }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Rule"
              value={selectedId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedId(id);
                loadRuleDetails(id);
              }}
              margin="normal"
            >
              {rules.map((rule) => (
                <MenuItem key={rule.id} value={rule.id}>
                  {rule.type.toUpperCase()} - {rule.condition_type} ({rule.operator} {rule.value})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}

      {selectedId && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              select
              label="Type"
              fullWidth
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="earn">Earn</MenuItem>
              <MenuItem value="redeem">Redeem</MenuItem>
              <MenuItem value="condition">Condition</MenuItem>
              <MenuItem value="downgrade">Downgrade</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Condition Type"
              fullWidth
              value={form.condition_type}
              onChange={(e) => handleChange('condition_type', e.target.value)}
            >
              <MenuItem value="total_spending">Total Spending</MenuItem>
              <MenuItem value="visit_count">Visit Count</MenuItem>
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
              label="Reward Value"
              fullWidth
              type="number"
              value={form.reward_value}
              onChange={(e) => handleChange('reward_value', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Unit Type"
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
            value={form.description || ''}
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
              label="Target"
              fullWidth
              value={form.target_id}
              onChange={(e) => handleChange('target_id', e.target.value)}
              disabled={!form.target_type}
            >
              {targets.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}

      <Box mt={4} textAlign="right">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedId}
        >
          Update Rule
        </Button>
      </Box>
    </Card>
  );
};

export default RuleEdit;
