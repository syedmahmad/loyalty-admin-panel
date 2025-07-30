// pages/wallet/WalletSettingsPage.tsx
"use client";

import {
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import WalletSettingsForm from "./walletSettingsForm"; // The drawer
import { WalletService } from "../wallets/service/wallet.service";

export default function WalletSettingsPage() {
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBU, setSelectedBU] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    WalletService.getBusinessUnits().then((res) => setBusinessUnits(res!.data));
  }, []);

  const fetchSettings = async (buId: any) => {
    setLoading(true);
    const res = await WalletService.getSettings(buId);
    setSettings(res?.data || null);
    setLoading(false);
  };

  const handleBUChange = (e: any) => {
    const id = Number(e.target.value);
    setSelectedBU(id);
    fetchSettings(id);
  };

  return (
    <Box px={3}>
      <Typography
        variant="h5"
        mb={2}
        sx={{ fontSize: "32px", fontWeight: 600, fontFamily: "Outfit" }}
      >
        Wallet Settings
      </Typography>

      <Box display="flex" gap={2} alignItems="center" mb={3}>
        <Select
          size="small"
          value={selectedBU ?? ""}
          displayEmpty
          onChange={handleBUChange}
          sx={{ minWidth: 250, backgroundColor: "#fff" }}
        >
          <MenuItem value="">Select Business Unit</MenuItem>
          {businessUnits.map((bu: any) => (
            <MenuItem key={bu.id} value={bu.id}>
              {bu.name}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="outlined"
          sx={{
            backgroundColor: "#fff",
            fontFamily: "Outfit",
            fontWeight: 600,
          }}
          onClick={() => setDrawerOpen(true)}
          disabled={!selectedBU}
        >
          {settings ? "Update Settings" : "Create Settings"}
        </Button>
      </Box>

      {loading && (
        <Box textAlign="center">
          <CircularProgress size={24} />
        </Box>
      )}

      <WalletSettingsForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        businessUnitId={selectedBU}
        existingData={settings}
        onSave={() => {
          fetchSettings(selectedBU);
          setDrawerOpen(false);
        }}
      />
    </Box>
  );
}
