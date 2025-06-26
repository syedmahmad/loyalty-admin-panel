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
import { useEffect, useState } from 'react';
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
    rule_type: 'earn',
    min_transaction_amount: '',
    max_points_limit: '',
    conversion_factor: '',
    burn_factor: '',
    max_burn_percent: '',
    min_points_to_burn: '',
  };

  const [form, setForm] = useState(initialForm);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
      conversion_factor: form.conversion_factor ? parseFloat(form.conversion_factor) : null,
      burn_factor: form.burn_factor ? parseFloat(form.burn_factor) : null,
      max_burn_percent: form.max_burn_percent ? parseFloat(form.max_burn_percent) : null,
      min_points_to_burn: form.min_points_to_burn ? parseInt(form.min_points_to_burn) : null,
      description,
      created_by,
      updated_by: created_by,
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
          <InfoLabel label="Rule Type" tooltip="Choose whether this rule is for earning or burning points." />
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
          <InfoLabel label="Min Transaction Amount" tooltip="Minimum amount required for this rule to apply." />
          <TextField
            fullWidth
            type="number"
            value={form.min_transaction_amount}
            onChange={(e) => handleChange('min_transaction_amount', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <InfoLabel label="Max Points Limit" tooltip="Maximum points a user can earn or burn per transaction." />
          <TextField
            fullWidth
            type="number"
            value={form.max_points_limit}
            onChange={(e) => handleChange('max_points_limit', e.target.value)}
          />
        </Grid>

        {form.rule_type === 'earn' && (
          <Grid item xs={12}>
            <InfoLabel label="Conversion Factor" tooltip="Points earned per unit currency spent. For example, 1 point per 10 SAR = 0.1." />
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
              <InfoLabel label="Burn Factor" tooltip="Monetary value equivalent per point burned. For example, 1 point = 0.05 SAR." />
              <TextField
                fullWidth
                type="number"
                value={form.burn_factor}
                onChange={(e) => handleChange('burn_factor', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <InfoLabel label="Max Burn Percent" tooltip="Maximum percentage of bill that can be paid using points." />
              <TextField
                fullWidth
                type="number"
                value={form.max_burn_percent}
                onChange={(e) => handleChange('max_burn_percent', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <InfoLabel label="Min Points to Burn" tooltip="Minimum number of points required to initiate a redemption." />
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
