import {
  Box,
  Button,
  Drawer,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { WalletService } from '../service/wallet.service';

interface Props {
  open: boolean;
  onClose: () => void;
  walletId: number;
  onSuccess: () => void;
  selectedBU: number | null;
  fetchWallets: () => void;
}

const statusOptions = ['pending', 'active'];

export default function WalletTransactionDrawer({
  selectedBU,
  open,
  onClose,
  walletId,
  onSuccess,
  fetchWallets
}: Props) {
  const [form, setForm] = useState({
    amount: '',
    status: 'active',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.amount) {
      toast.warn('Amount is required');
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      await WalletService.addTransaction({
        business_unit_id: selectedBU,
        wallet_id: walletId,
        amount: parseFloat(form.amount),
        status: form.status as 'pending' | 'active',
        type: 'adjustment', // always adjustment
        source_type: 'admin',
        source_id: userInfo.id,
        description: form.description,
        created_by: userInfo.id
      });

      toast.success('Transaction added');
      fetchWallets()
      onClose();
      onSuccess(); // reload transactions
    } catch (err) {
      toast.error('Failed to add transaction');
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={500} p={3}>
        <Typography variant="h6" mb={2}>
          Manual Adjustment
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="Amount"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          fullWidth
          size="small"
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          {statusOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          size="small"
          multiline
          rows={3}
          label="Description (optional)"
          name="description"
          value={form.description}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" fullWidth onClick={handleSubmit}>
          Submit Adjustment
        </Button>
      </Box>
    </Drawer>
  );
}
