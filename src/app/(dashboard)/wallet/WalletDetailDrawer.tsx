// pages/wallet/WalletDetailDrawer.tsx

import {
  Box,
  Drawer,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { WalletService } from './service/wallet.service';
import { AnyCnameRecord } from 'node:dns';

interface Wallet {
  id: number;
  customer: any;
  total_balance: number;
  available_balance: number;
  locked_balance: number;
}

interface WalletTransaction {
  id: number;
  type: 'earn' | 'burn' | 'expire' | 'adjustment';
  amount: number;
  status: 'pending' | 'active' | 'expired';
  created_at: string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

export default function WalletDetailDrawer({ open, onClose, wallet }: Props) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet?.id) {
      fetchTransactions(wallet.id);
    }
  }, [wallet]);

  const fetchTransactions = async (walletId: number) => {
    setLoading(true);
    try {
      const res = await WalletService.getWalletTransactions(walletId);
      setTransactions(res?.data || []);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={500} p={3}>
        <Typography variant="h6" mb={2}>
          Wallet ID: {wallet?.id}
        </Typography>

        <Typography variant="body2" gutterBottom>
          User Name: {wallet?.customer?.name || 'N/A'}
        </Typography>
        <Typography variant="body2">Total: {wallet?.total_balance}</Typography>
        <Typography variant="body2">
          Available: {wallet?.available_balance}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Locked: {wallet?.locked_balance}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" mb={1}>
          Transactions
        </Typography>

        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.status}</TableCell>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Box mt={3}>
          <Button variant="contained" fullWidth disabled>
            Add Manual Transaction (Coming next)
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
