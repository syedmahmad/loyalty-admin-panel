'use client';

import {
  Box,
  Button,
  Card,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Tooltip,
  IconButton,
  InputLabel,
} from '@mui/material';
import { useState } from 'react';
import { POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/TextEditor';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const InfoLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Box display="flex" alignItems="center" mb={0.5}>
    <InputLabel sx={{ mr: 0.5 }}>{label}</InputLabel>
    <Tooltip title={tooltip} placement="top" arrow>
      <IconButton size="small" sx={{ p: 0.25 }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

const RuleCreateForm = () => {
  const router = useRouter();
  const userInfo = JSON.parse(localStorage.getItem('client-info') || '{}');
  const created_by = userInfo?.id;

  const initialForm = {
    name: '',
    rule_type: 'event based earn',
    min_amount_spent: '',
    reward_points: '',
    event_triggerer: '',
    max_redeemption_points_limit: '',
    points_conversion_factor: '',
    max_burn_percent_on_invoice: '',
  };

  const [form, setForm] = useState(initialForm);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.rule_type) {
      toast.error('Please fill all required fields');
      return;
    }

    if (
      (form.rule_type === 'event based earn' && (!form.event_triggerer || !form.reward_points)) ||
      (form.rule_type === 'spend and earn' && (!form.min_amount_spent || !form.reward_points)) ||
      (form.rule_type === 'burn' &&
        (!form.min_amount_spent ||
         !form.max_redeemption_points_limit ||
         !form.points_conversion_factor ||
         !form.max_burn_percent_on_invoice))
    ) {
      toast.error('Please fill all required fields for this rule type');
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name,
      rule_type: form.rule_type,
      min_amount_spent: form.min_amount_spent ? parseFloat(form.min_amount_spent) : null,
      reward_points: form.reward_points ? parseFloat(form.reward_points) : null,
      event_triggerer: form.event_triggerer || null,
      max_redeemption_points_limit: form.max_redeemption_points_limit
        ? parseInt(form.max_redeemption_points_limit)
        : null,
      points_conversion_factor: form.points_conversion_factor
        ? parseFloat(form.points_conversion_factor)
        : null,
      max_burn_percent_on_invoice: form.max_burn_percent_on_invoice
        ? parseFloat(form.max_burn_percent_on_invoice)
        : null,
      description,
      created_by,
    };

    const response = await POST('/rules', payload);

    if (response?.status === 201) {
      toast.success('Rule created successfully!');
      setForm(initialForm);
      setDescription('');
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
        <Grid item xs={12}>
          <InfoLabel label="Rule Name" tooltip="Name of the rule to identify it easily." />
          <TextField
            fullWidth
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <InfoLabel label="Rule Type" tooltip="Choose the rule logic to apply." />
          <TextField
            select
            fullWidth
            value={form.rule_type}
            onChange={(e) => handleChange('rule_type', e.target.value)}
          >
            <MenuItem value="event based earn">Event-Based Earn</MenuItem>
            <MenuItem value="spend and earn">Spend & Earn</MenuItem>
            <MenuItem value="burn">Burn</MenuItem>
          </TextField>
        </Grid>

        {form.rule_type === 'event based earn' && (
          <Grid item xs={12}>
            <InfoLabel label="Event Triggerer" tooltip="Triggering event like signup or birthday." />
            <TextField
              fullWidth
              value={form.event_triggerer}
              onChange={(e) => handleChange('event_triggerer', e.target.value)}
              placeholder="e.g. signup, birthday"
            />
          </Grid>
        )}

        {(form.rule_type === 'spend and earn' || form.rule_type === 'burn') && (
          <Grid item xs={12}>
            <InfoLabel label="Minimum Amount Spent" tooltip="Minimum spend amount to activate the rule." />
            <TextField
              fullWidth
              type="number"
              value={form.min_amount_spent}
              onChange={(e) => handleChange('min_amount_spent', e.target.value)}
            />
          </Grid>
        )}

        {(form.rule_type === 'event based earn' || form.rule_type === 'spend and earn') && (
          <Grid item xs={12}>
            <InfoLabel label="Reward Points" tooltip="Number of points to be awarded." />
            <TextField
              fullWidth
              type="number"
              value={form.reward_points}
              onChange={(e) => handleChange('reward_points', e.target.value)}
            />
          </Grid>
        )}

        {form.rule_type === 'burn' && (
          <>
            <Grid item xs={12}>
              <InfoLabel label="Max Redeemable Points" tooltip="Max points a user can burn in a transaction." />
              <TextField
                fullWidth
                type="number"
                value={form.max_redeemption_points_limit}
                onChange={(e) => handleChange('max_redeemption_points_limit', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <InfoLabel label="Points Conversion Factor" tooltip="Points to currency value ratio." />
              <TextField
                fullWidth
                type="number"
                value={form.points_conversion_factor}
                onChange={(e) => handleChange('points_conversion_factor', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <InfoLabel label="Max Burn % on Invoice" tooltip="Maximum invoice value percentage that can be paid using points." />
              <TextField
                fullWidth
                type="number"
                value={form.max_burn_percent_on_invoice}
                onChange={(e) => handleChange('max_burn_percent_on_invoice', e.target.value)}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Description (optional)
          </Typography>
          <RichTextEditor value={description} setValue={setDescription} language="en" />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Create Rule'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => router.push('view')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Go Back
        </Button>
      </Box>
    </Card>
  );
};

export default RuleCreateForm;
