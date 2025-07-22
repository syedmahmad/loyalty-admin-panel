// pages/wallet/WalletSettingsForm.tsx

import {
  Box,
  Button,
  Drawer,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { WalletService } from '../wallets/service/wallet.service';

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
  });

  useEffect(() => {
    if (existingData) {
      setForm({
        pending_method: existingData.pending_method || 'none',
        pending_days: existingData.pending_days || '',
        expiration_method: existingData.expiration_method || 'none',
        expiration_value: existingData.expiration_value || '',
      });
    } else {
      setForm({
        pending_method: 'none',
        pending_days: '',
        expiration_method: 'none',
        expiration_value: '',
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
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        ...form,
        business_unit_id: businessUnitId,
        created_by: userInfo.id
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
        <Typography   sx={{
              backgroundColor: '#fff',
              fontFamily:'Outfit',
              fontWeight: 600,
  
   
  }} mb={2}>
          Wallet Settings
        </Typography>

        <Box mb={2}>
          <Typography variant="subtitle2">Pending Method</Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Determines if newly earned points should be locked (pending) for a certain number of days before they become spendable.
            Useful for preventing immediate redemption and allowing for fraud checks or returns.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            name="pending_method"
            label="Pending Method"
            value={form.pending_method}
            onChange={handleChange}
          >
            {pendingOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Box>

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

        <Box mb={2}>
          <Typography variant="subtitle2">Expiration Method</Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Controls how and when wallet points expire. Helps manage liabilities and encourages timely usage of rewards by customers.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            name="expiration_method"
            label="Expiration Method"
            value={form.expiration_method}
            onChange={handleChange}
          >
            {expirationOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Box>

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

        <Box mt={3}
        >
          <Button variant="outlined" 
             sx={{
              backgroundColor: '#fff',
              fontFamily:'Outfit',
              fontWeight: 600,
  
   
  }}  onClick={handleSubmit}>
            Save Settings
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
