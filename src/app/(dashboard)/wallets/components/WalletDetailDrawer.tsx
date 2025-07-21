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
  Grid,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { WalletService } from '../service/wallet.service';
import WalletTransactionDrawer from './WalletTransactionDrawer';

interface Wallet {
  id: number;
  customer: { name: string };
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
  selectedBU: number | null;
  fetchWallets: () => void;
}

export default function WalletDetailDrawer({ open, onClose, wallet, selectedBU, fetchWallets }: Props) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [txDrawerOpen, setTxDrawerOpen] = useState(false);

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
      <Box width={600} p={3}>
        {/* Wallet ID + User */}
        <Grid container spacing={2} alignItems="center" mb={3}>
          <Grid item xs={6}>
            <Typography variant="h4">
              {wallet?.customer?.name || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h4" textAlign="right">
              Wallet ID: <strong>{wallet?.id}</strong>
            </Typography>
          </Grid>
        </Grid>

        {/* Stat Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">Total Points</Typography>
              <Typography fontWeight={600}>
                {wallet?.total_balance ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">Available Points</Typography>
              <Typography fontWeight={600}>
                {wallet?.available_balance ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">Locked Points</Typography>
              <Typography fontWeight={600}>
                {wallet?.locked_balance ?? 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

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
                <TableCell>Reason</TableCell>
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
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <br />
        <Button variant="contained" fullWidth onClick={() => setTxDrawerOpen(true)}>
          Add Manual Adjustment
        </Button>

        <WalletTransactionDrawer
          fetchWallets={fetchWallets}
          selectedBU={selectedBU}
          open={txDrawerOpen}
          onClose={() => {setTxDrawerOpen(false), onClose()}}
          walletId={wallet?.id || 0}
          onSuccess={() => fetchTransactions(wallet?.id || 0)}
        />
      </Box>
    </Drawer>
  );
}
