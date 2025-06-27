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
  Tooltip,
  IconButton,
  InputLabel,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GET, PUT } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { RichTextEditor } from '@/components/TextEditor';

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

const RuleEdit = () => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');
  const router = useRouter();
  const clientInfo = JSON.parse(localStorage.getItem('client-info') || '{}');
  const updated_by = clientInfo?.id;

  const [form, setForm] = useState(initialForm);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(paramId || '');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadRuleDetails = async (ruleId: string) => {
    setLoading(true);
    const res = await GET(`/rules/${ruleId}`);
    const rule = res?.data;

    if (rule) {
      setForm({
        name: rule.name,
        rule_type: rule.rule_type,
        min_amount_spent: rule.min_amount_spent?.toString() || '',
        reward_points: rule.reward_points?.toString() || '',
        event_triggerer: rule.event_triggerer || '',
        max_redeemption_points_limit: rule.max_redeemption_points_limit?.toString() || '',
        points_conversion_factor: rule.points_conversion_factor?.toString() || '',
        max_burn_percent_on_invoice: rule.max_burn_percent_on_invoice?.toString() || '',
      });
      setDescription(rule.description || '');
    }
    setLoading(false);
  };

  const fetchAllRules = async () => {
    const res = await GET('/rules');
    setRules(res?.data || []);
  };

  useEffect(() => {
    if (paramId) {
      setSelectedId(paramId);
      loadRuleDetails(paramId);
    } else {
      fetchAllRules();
    }
  }, [paramId]);

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
      updated_by,
    };

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
    <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        ✏️ Edit Rule
      </Typography>

      {!paramId && (
        <Grid container spacing={2} sx={{ mb: 1 }}>
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
                  {rule.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}

      {selectedId && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <InfoLabel label="Rule Name" tooltip="Enter a descriptive name for this rule." />
            <TextField
              fullWidth
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <InfoLabel label="Rule Type" tooltip="Select the type of rule logic to apply." />
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

          {(form.rule_type === 'event based earn' || form.rule_type === 'spend and earn') && (
            <Grid item xs={12}>
              <InfoLabel label="Reward Points" tooltip="Number of points awarded." />
              <TextField
                fullWidth
                type="number"
                value={form.reward_points}
                onChange={(e) => handleChange('reward_points', e.target.value)}
              />
            </Grid>
          )}

          {form.rule_type === 'event based earn' && (
            <Grid item xs={12}>
              <InfoLabel label="Event Triggerer" tooltip="Triggering event like signup or birthday." />
              <TextField
                fullWidth
                value={form.event_triggerer}
                onChange={(e) => handleChange('event_triggerer', e.target.value)}
              />
            </Grid>
          )}

          {(form.rule_type === 'spend and earn' || form.rule_type === 'burn') && (
            <Grid item xs={12}>
              <InfoLabel label="Minimum Amount Spent" tooltip="Minimum spend required to apply the rule." />
              <TextField
                fullWidth
                type="number"
                value={form.min_amount_spent}
                onChange={(e) => handleChange('min_amount_spent', e.target.value)}
              />
            </Grid>
          )}

          {form.rule_type === 'burn' && (
            <>
              <Grid item xs={12}>
                <InfoLabel label="Max Redeemable Points" tooltip="Max points a user can burn per transaction." />
                <TextField
                  fullWidth
                  type="number"
                  value={form.max_redeemption_points_limit}
                  onChange={(e) => handleChange('max_redeemption_points_limit', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <InfoLabel label="Points Conversion Factor" tooltip="Conversion rate from points to currency." />
                <TextField
                  fullWidth
                  type="number"
                  value={form.points_conversion_factor}
                  onChange={(e) => handleChange('points_conversion_factor', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <InfoLabel label="Max Burn % on Invoice" tooltip="Max percent of invoice payable using points." />
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
      )}

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Update Rule'}
        </Button>
      </Box>
    </Card>
  );
};

export default RuleEdit;

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
