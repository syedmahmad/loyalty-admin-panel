// pages/wallet/WalletListPage.tsx
"use client";
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
} from "@mui/material";
import { useEffect, useState } from "react";
import { WalletService } from "./service/wallet.service";
import WalletDetailDrawer from "./components/WalletDetailDrawer";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  const [selectedBU, setSelectedBU] = useState<number | null>(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    WalletService.getBusinessUnits().then((res) => setBusinessUnits(res?.data));
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [selectedBU]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      // if (!selectedBU) {
      //   setWallets([]);
      //   return;
      // }
      const res = await WalletService.getWallets(selectedBU ?? undefined);
      setWallets(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h5"
        mb={2}
        sx={{ fontSize: "32px", fontWeight: 600, fontFamily: "Outfit" }}
      >
        Wallets
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Select
          size="small"
          value={selectedBU}
          onChange={(e) => setSelectedBU(Number(e.target.value))}
          displayEmpty
          sx={{ minWidth: 250, backgroundColor: "#fff" }}
        >
          <MenuItem value={0}>Select Business Unit</MenuItem>
          {businessUnits.map((bu) => (
            <MenuItem key={bu.id} value={bu.id}>
              {bu.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
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
                    <MoreVertIcon />
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
