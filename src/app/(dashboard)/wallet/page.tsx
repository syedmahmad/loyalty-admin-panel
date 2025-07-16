// pages/wallet/WalletListPage.tsx
'use client';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { WalletService } from './service/wallet.service';
import WalletDetailDrawer from './components/WalletDetailDrawer';

interface BusinessUnit {
  id: number;
  name: string;
}

interface Wallet {
  id: number;
  customer: any;
  total_balance: number;
  available_balance: number;
  locked_balance: number;
}

export default function WalletListPage() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [selectedBU, setSelectedBU] = useState<number | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    WalletService.getBusinessUnits().then((res) => setBusinessUnits(res?.data));
  }, []);

  useEffect(() => {
    if (selectedBU !== null) {
      fetchWallets();
    }
  }, [selectedBU]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await WalletService.getWallets(selectedBU ?? undefined);
      setWallets(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Wallets
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Select
          size="small"
          value={selectedBU ?? ''}
          onChange={(e) => setSelectedBU(Number(e.target.value))}
          displayEmpty
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">Select Business Unit</MenuItem>
          {businessUnits.map((bu) => (
            <MenuItem key={bu.id} value={bu.id}>
              {bu.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Wallet ID</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Locked</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wallets.map((wallet: any) => (
              <TableRow key={wallet.id}>
                <TableCell>{wallet.id}</TableCell>
                <TableCell>{wallet.customer.name}</TableCell>
                <TableCell>{wallet.total_balance}</TableCell>
                <TableCell>{wallet.available_balance}</TableCell>
                <TableCell>{wallet.locked_balance}</TableCell>
                <TableCell>
                  <IconButton onClick={() => setSelectedWallet(wallet)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <WalletDetailDrawer
        fetchWallets={fetchWallets}
        wallet={selectedWallet}
        selectedBU={selectedBU}
        open={!!selectedWallet}
        onClose={() => setSelectedWallet(null)}
      />
    </Box>
  );
}
