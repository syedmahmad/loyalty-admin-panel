// pages/wallet/WalletSettingsForm.tsx

import {
  Box,
  Button,
  Drawer,
  TextField,
  Typography,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { WalletService } from '../service/wallet.service';

const pendingOptions = ['none', 'fixed_days'];
const expirationOptions = [
  'none',
  'fixed_days',
  'end_of_month',
  'end_of_year',
  'annual_date',
];

export default function WalletSettingsForm({
  open,
  onClose,
  businessUnitId,
  existingData,
  onSave,
}: any) {
  const [form, setForm] = useState({
    pending_method: 'none',
    pending_days: '',
    expiration_method: 'none',
    expiration_value: '',
    allow_negative_balance: false,
  });

  useEffect(() => {
    if (existingData) {
      setForm({
        pending_method: existingData.pending_method || 'none',
        pending_days: existingData.pending_days || '',
        expiration_method: existingData.expiration_method || 'none',
        expiration_value: existingData.expiration_value || '',
        allow_negative_balance: existingData.allow_negative_balance || false,
      });
    } else {
      setForm({
        pending_method: 'none',
        pending_days: '',
        expiration_method: 'none',
        expiration_value: '',
        allow_negative_balance: false,
      });
    }
  }, [existingData, open]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        business_unit_id: businessUnitId,
        created_by: 1, // Replace with actual admin ID if available
      };
      await WalletService.saveSettings(payload);
      toast.success('Wallet settings saved!');
      onSave();
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={400} p={3}>
        <Typography variant="h6" mb={2}>
          Wallet Settings
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          name="pending_method"
          label="Pending Method"
          value={form.pending_method}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          {pendingOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {form.pending_method === 'fixed_days' && (
          <TextField
            fullWidth
            size="small"
            name="pending_days"
            label="Pending Days"
            type="number"
            value={form.pending_days}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          select
          fullWidth
          size="small"
          name="expiration_method"
          label="Expiration Method"
          value={form.expiration_method}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          {expirationOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {form.expiration_method !== 'none' && (
          <TextField
            fullWidth
            size="small"
            name="expiration_value"
            label="Expiration Value"
            value={form.expiration_value}
            onChange={handleChange}
            placeholder={
              form.expiration_method === 'annual_date' ? 'MM-DD (e.g. 12-31)' : ''
            }
            sx={{ mb: 2 }}
          />
        )}

        <FormControlLabel
          control={
            <Switch
              name="allow_negative_balance"
              checked={form.allow_negative_balance}
              onChange={handleChange}
            />
          }
          label="Allow Negative Balance"
        />

        <Box mt={3}>
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Save Settings
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
