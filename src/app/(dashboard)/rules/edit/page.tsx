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
  rule_type: 'earn',
  min_transaction_amount: '',
  max_points_limit: '',
  conversion_factor: '',
  burn_factor: '',
  max_burn_percent: '',
  min_points_to_burn: '',
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
        min_transaction_amount: rule.min_transaction_amount?.toString() || '',
        max_points_limit: rule.max_points_limit?.toString() || '',
        conversion_factor: rule.earn_conversion_factor?.toString() || '',
        burn_factor: rule.burn_factor?.toString() || '',
        max_burn_percent: rule.max_burn_percent?.toString() || '',
        min_points_to_burn: rule.min_points_to_burn?.toString() || '',
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
    if (!form.name || !form.rule_type || !form.max_points_limit) {
      toast.error('Please fill all required fields');
      return;
    }

    if (form.rule_type === 'earn' && !form.conversion_factor) {
      toast.error('Conversion factor is required for earn rules');
      return;
    }

    if (form.rule_type === 'burn' && (!form.burn_factor || !form.max_burn_percent)) {
      toast.error('Burn factor and max burn percent are required for burn rules');
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name,
      rule_type: form.rule_type,
      min_transaction_amount: form.min_transaction_amount ? parseFloat(form.min_transaction_amount) : null,
      max_points_limit: parseInt(form.max_points_limit),
      earn_conversion_factor: form.conversion_factor ? parseFloat(form.conversion_factor) : null,
      burn_factor: form.burn_factor ? parseFloat(form.burn_factor) : null,
      max_burn_percent: form.max_burn_percent ? parseFloat(form.max_burn_percent) : null,
      min_points_to_burn: form.min_points_to_burn ? parseInt(form.min_points_to_burn) : null,
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
            <InfoLabel
              label="Rule Name"
              tooltip="Enter a descriptive name for this rule."
            />
            <TextField
              fullWidth
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <InfoLabel
              label="Rule Type"
              tooltip="Select whether this rule is for earning or burning points."
            />
            <TextField
              select
              fullWidth
              value={form.rule_type}
              onChange={(e) => handleChange('rule_type', e.target.value)}
            >
              <MenuItem value="earn">Earn</MenuItem>
              <MenuItem value="burn">Burn</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <InfoLabel
              label="Min Transaction Amount"
              tooltip="The minimum amount required for the rule to apply."
            />
            <TextField
              fullWidth
              type="number"
              value={form.min_transaction_amount}
              onChange={(e) => handleChange('min_transaction_amount', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <InfoLabel
              label="Max Points Limit"
              tooltip="The maximum number of points a user can earn from this rule."
            />
            <TextField
              fullWidth
              type="number"
              value={form.max_points_limit}
              onChange={(e) => handleChange('max_points_limit', e.target.value)}
            />
          </Grid>

          {form.rule_type === 'earn' && (
            <Grid item xs={12}>
              <InfoLabel
                label="Conversion Factor"
                tooltip="Number of points awarded per currency unit spent."
              />
              <TextField
                fullWidth
                type="number"
                value={form.conversion_factor}
                onChange={(e) => handleChange('conversion_factor', e.target.value)}
              />
            </Grid>
          )}

          {form.rule_type === 'burn' && (
            <>
              <Grid item xs={12}>
                <InfoLabel
                  label="Burn Factor"
                  tooltip="Value per point burned (e.g., $0.01 per point)."
                />
                <TextField
                  fullWidth
                  type="number"
                  value={form.burn_factor}
                  onChange={(e) => handleChange('burn_factor', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <InfoLabel
                  label="Max Burn Percent"
                  tooltip="Maximum % of transaction value that can be paid using points."
                />
                <TextField
                  fullWidth
                  type="number"
                  value={form.max_burn_percent}
                  onChange={(e) => handleChange('max_burn_percent', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <InfoLabel
                  label="Min Points to Burn"
                  tooltip="Minimum number of points required to burn in one transaction."
                />
                <TextField
                  fullWidth
                  type="number"
                  value={form.min_points_to_burn}
                  onChange={(e) => handleChange('min_points_to_burn', e.target.value)}
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
