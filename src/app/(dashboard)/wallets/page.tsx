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
  Grid,
  Card,
  CardContent,
  Menu,
  TableContainer,
  Paper,
  Button,
  Pagination,
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
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const count = wallets.length;
  const totalPages = Math.ceil(count / rowsPerPage);

  useEffect(() => {
    WalletService.getBusinessUnits().then((res) => {
      setBusinessUnits(res?.data);
      const defaultBu = res?.data.find(
        (singleBu: { location: string }) =>
          singleBu.location === "system created"
      );
      setSelectedBU(Number(defaultBu?.id) || 0);
    });
  }, []);

  useEffect(() => {
    setPage(0);
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

  const handleChangePage = (_: unknown, newPage: number) =>
    setPage(newPage - 1);

  const paginatedWallet =
    viewMode === "card"
      ? wallets
      : wallets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  return (
    <Box sx={{ backgroundColor: "#F9FAFB", mt: "-25px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            color: "rgba(0, 0, 0, 0.87)",
            fontFamily: "Outfit",
            fontSize: "32px",
            fontWeight: 600,
          }}
        >
          Wallets
        </Typography>

        <Box sx={{ gap: 1, display: "flex" }}>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "card" | "table")}
            size="small"
            sx={{
              backgroundColor: "#fff",
              fontFamily: "Outfit",
              fontWeight: 600,
            }}
          >
            <MenuItem value="card">Card View</MenuItem>
            <MenuItem value="table">Table View</MenuItem>
          </Select>
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <Select
          size="small"
          value={selectedBU}
          onChange={(e) => setSelectedBU(Number(e.target.value))}
          displayEmpty
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
          <MenuItem value={0}>Select Business Unit</MenuItem>
          {businessUnits.map((bu) => (
            <MenuItem key={bu.id} value={bu.id}>
              {bu.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Wallet ID11</TableCell>
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
      )} */}

      {loading ? (
        <Box mt={4} textAlign="center">
          <CircularProgress />
        </Box>
      ) : wallets.length === 0 ? (
        <Typography mt={3} textAlign="center">
          No record found.
        </Typography>
      ) : viewMode === "card" ? (
        <Grid container spacing={3}>
          {paginatedWallet.map((wallet) => (
            <Grid item xs={12} sm={6} md={4} key={wallet.id}>
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
                      {wallet?.customer?.name}
                    </Typography>
                    <Box>
                      <IconButton onClick={() => setSelectedWallet(wallet)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Wallet ID: {wallet.id}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Total: {wallet?.total_balance}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Available: {wallet.available_balance}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Locked: {wallet.locked_balance}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <TableContainer component={Paper}>
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
                {wallets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((wallet: any) => (
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
          </TableContainer>

          <Box
            component={Paper}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #E0E0E0", // top border line
              paddingY: 2,
              paddingX: 2,
            }}
          >
            {/* Previous Button */}
            <Button
              variant="outlined"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 0}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                minWidth: 100,
              }}
            >
              ← Previous
            </Button>

            {/* Pagination */}
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handleChangePage}
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              hidePrevButton
              hideNextButton
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: "8px",
                  fontWeight: 500,
                  minWidth: "36px",
                  height: "36px",
                },
              }}
            />

            {/* Next Button */}
            <Button
              variant="outlined"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages - 1}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                minWidth: 100,
              }}
            >
              Next →
            </Button>
          </Box>
        </>
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
