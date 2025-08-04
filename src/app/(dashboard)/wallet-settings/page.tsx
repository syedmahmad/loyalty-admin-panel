// pages/wallet/WalletSettingsPage.tsx
"use client";

import {
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import WalletSettingsForm from "./walletSettingsForm"; // The drawer
import { WalletService } from "../wallets/service/wallet.service";

type WalletSetting = {
  id: number;
  pending_method: string;
  pending_days: number;
  expiration_method?: string;
  expiration_value?: number;
  allow_negative_balance?: number;
  business_unit?: any;
};

export default function WalletSettingsPage() {
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBU, setSelectedBU] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [allWalletSettings, setAllWalletSettings] = useState<WalletSetting[]>(
    []
  );

  const [selectedSetting, setSelectedSetting] = useState<null | WalletSetting>(
    null
  );
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [page, setPage] = useState(0);
  const count = viewMode.length;
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const totalPages = Math.ceil(count / rowsPerPage);

  useEffect(() => {
    WalletService.getBusinessUnits().then((res) => setBusinessUnits(res!.data));
    fetchAllWalltetSettings();
  }, []);

  useEffect(() => {
    setAllWalletSettings(settings ? [settings] : []);
  }, [settings]);

  const fetchSettings = async (buId: any) => {
    setLoading(true);
    const res = await WalletService.getSettings(buId);
    setSettings(res?.data || null);
    setLoading(false);
  };

  const fetchAllWalltetSettings = async () => {
    setLoading(true);
    const allWalletSettings = await WalletService.getAllWalletSettings();
    setAllWalletSettings(allWalletSettings?.data || []);
    setLoading(false);
  };

  const handleBUChange = (e: any) => {
    setAllWalletSettings([]);
    const id = Number(e.target.value);
    if (id === 0) {
      setSelectedBU(null);
      fetchAllWalltetSettings();
    } else {
      setSelectedBU(id);
      fetchSettings(id);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    setting: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedSetting(setting);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedSetting(null);
  };

  const updateSettingClick = (selectedSetting) => {
    console.log("AAAAA", selectedSetting?.business_unit?.id);
    setSelectedBU(selectedSetting?.business_unit?.id);
    setSettings(selectedSetting);
    setDrawerOpen(true);
  };

  useEffect(() => {}, [allWalletSettings]);

  const paginatedSetting =
    viewMode === "card"
      ? allWalletSettings
      : allWalletSettings.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        );

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", mt: "-25px" }}>
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
          sx={{
            backgroundColor: "#fff",
            fontFamily: "Outfit",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "15px",
            lineHeight: "22px",
            borderBottom: "1px solid #e0e0e0",
            borderRadius: 2,
            minWidth: 250,
            "& .MuiInputBase-input": {
              fontFamily: "Outfit",
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "22px",
            },
          }}
        >
          <MenuItem value="">Select Business Unit</MenuItem>
          {businessUnits.map((bu: any) => (
            <MenuItem key={bu.id} value={bu.id}>
              {bu.name}
            </MenuItem>
          ))}
        </Select>

        {!settings && (
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
            Create Settings
          </Button>
        )}
      </Box>

      {loading ? (
        <Box mt={4} textAlign="center">
          <CircularProgress />
        </Box>
      ) : allWalletSettings.length === 0 ? (
        <Typography mt={3} textAlign="center">
          No record found.
        </Typography>
      ) : viewMode === "card" ? (
        <Grid container spacing={3}>
          {paginatedSetting.map((setting) => (
            <Grid item xs={12} sm={6} md={4} key={setting?.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                  transition: "none",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {" "}
                    <Typography
                      variant="h3"
                      fontWeight={500}
                      sx={{
                        fontFamily: "Outfit",
                        fontSize: "14px",
                        lineHeight: "21px",
                        letterSpacing: "0%",
                      }}
                    >
                      {setting?.business_unit?.name}
                    </Typography>
                    <Box>
                      <IconButton
                        onClick={(event) => handleMenuClick(event, setting)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        slotProps={{
                          paper: {
                            sx: {
                              boxShadow: "none",
                              border: "1px solid #e0e0e0",
                              mt: 1,
                            },
                          },
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            if (selectedSetting) {
                              updateSettingClick(selectedSetting);
                            }
                          }}
                        >
                          <EditIcon
                            fontSize="small"
                            style={{ marginRight: 8 }}
                          />
                          Update Setting
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Pending Method: {setting.pending_method}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Pending Days: {setting.pending_days}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Expiration Method: {setting.expiration_method}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Expiration Value: {setting.expiration_value}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Allow Negative Balance: {setting.allow_negative_balance}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>TABLE</>
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
