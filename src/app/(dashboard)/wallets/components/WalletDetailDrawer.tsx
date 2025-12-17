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
  Pagination,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { WalletService } from "../service/wallet.service";
import WalletTransactionDrawer from "./WalletTransactionDrawer";
import WalletOrderDrawer from "./WalletOrderDrawer";

interface Wallet {
  id: number;
  customer: { name: string };
  total_balance: number;
  available_balance: number;
  locked_balance: number;
}

interface WalletTransaction {
  orders: any;
  id: number;
  type: "earn" | "burn" | "expire" | "adjustment";
  amount: number;
  point_balance: number;
  status: "pending" | "active" | "expired";
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

export default function WalletDetailDrawer({
  open,
  onClose,
  wallet,
  selectedBU,
  fetchWallets,
}: Props) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [txDrawerOpen, setTxDrawerOpen] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [totalEarn, setTotalEarn] = useState(0);
  const [totalBurn, setTotalBurn] = useState(0);

  //Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (wallet?.id) {
      fetchTransactions(wallet.id, page, searchValue);
    }
  }, [wallet, searchValue]);

  const fetchTransactions = async (
    walletId: number,
    pageNumber: number,
    searchValue: string
  ) => {
    setLoading(true);
    try {
      const res: any = await WalletService.getWalletTransactions(
        walletId,
        pageNumber,
        pageSize,
        searchValue
      );

      setTransactions(res?.data?.data || []);
      setTotalPages(Math.ceil((res?.data?.total || 0) / pageSize));
      setPage(pageNumber);

      const { totalEarnAmount, totalBurnAmount } = res?.data?.data.reduce(
        (acc: any, curr: any) => {
          if (curr.type === "earn") acc.totalEarnAmount += Number(curr.amount);
          if (curr.type === "burn") acc.totalBurnAmount += Number(curr.amount);
          return acc;
        },
        { totalEarnAmount: 0, totalBurnAmount: 0 }
      );
      setTotalEarn(totalEarnAmount);
      setTotalBurn(totalBurnAmount);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={800} p={2}>
        {/* Wallet ID + User */}
        <Grid container spacing={2} alignItems="center" mb={0}>
          {/* Customer Name - Left */}
          <Grid item xs={5}>
            <Typography variant="h4">
              {wallet?.customer?.name || "N/A"}
            </Typography>
          </Grid>

          {/* Wallet ID - Center */}
          <Grid item xs={5}>
            <Typography variant="h4">
              Wallet ID: <strong>{wallet?.id}</strong>
            </Typography>
          </Grid>

          {/* Close Button - Right */}
          <Grid item xs={2} textAlign="right">
            <IconButton
              edge="end"
              onClick={() => {
                onClose();
              }}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2 }} />

        {/* Stat Cards */}
        <Grid container spacing={2} mb={3} alignItems="stretch">
          {/* Total Points Breakdown */}
          <Grid item xs={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Total Earn
                </Typography>
                <Typography fontWeight={600}>{totalEarn}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Total Burn
                </Typography>
                <Typography fontWeight={600} color="error.main">
                  {totalBurn}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between" mt="auto">
                <Typography variant="body1" fontWeight={600}>
                  Total Points
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {wallet?.total_balance ?? 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Available Points */}
          <Grid item xs={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Available Points
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {wallet?.available_balance ?? 0}
              </Typography>
            </Paper>
          </Grid>

          {/* Locked Points */}
          <Grid item xs={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Locked Points
              </Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main">
                {wallet?.locked_balance ?? 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" mb={1}>
          Transactions
        </Typography>

        <Box mb={2}>
          <TextField
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{
              backgroundColor: "#fff",
              fontFamily: "Outfit",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "15px",
              borderBottom: "1px solid #e0e0e0",
              borderRadius: 2,
              "& .MuiInputBase-input": {
                fontFamily: "Outfit",
                fontWeight: 400,
                fontSize: "15px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9e9e9e" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontFamily: "Outfit",
                fontWeight: 400,
              },
            }}
          />
        </Box>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress size={20} />
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Point</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Date</TableCell>
                  {/* <TableCell>Order</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={tx.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>{tx?.point_balance}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    {/* <TableCell>
                      {tx?.orders && (
                        <IconButton
                          onClick={() => {
                            setOrderDetails(tx?.orders);
                            setOrderDrawerOpen(true);
                          }}
                        >
                          <AddShoppingCartIcon
                            fontSize="small"
                            color="primary"
                          />
                        </IconButton>
                      )}
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #E0E0E0",
                paddingY: 2,
                paddingX: 2,
              }}
            >
              {/* Previous Button */}
              <Button
                variant="outlined"
                onClick={() => {
                  if (!wallet?.id) return;
                  fetchTransactions(wallet?.id, page - 1, searchValue);
                }}
                disabled={page === 1}
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
                page={page}
                onChange={(_, value) => {
                  if (!wallet?.id) return;
                  fetchTransactions(wallet.id, value, searchValue);
                }}
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
                onClick={() => {
                  if (!wallet?.id) return;
                  fetchTransactions(wallet?.id, page + 1, searchValue);
                }}
                disabled={page === totalPages || !transactions.length}
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
        <br />
        <Button
          variant="contained"
          fullWidth
          onClick={() => setTxDrawerOpen(true)}
        >
          Add Manual Adjustment
        </Button>

        <WalletTransactionDrawer
          fetchWallets={fetchWallets}
          selectedBU={selectedBU}
          open={txDrawerOpen}
          onClose={() => {
            setTxDrawerOpen(false);
          }}
          walletId={wallet?.id || 0}
          wallet={wallet}
          onSuccess={() =>
            fetchTransactions(wallet?.id || 0, page, searchValue)
          }
        />

        <WalletOrderDrawer
          orderDetails={orderDetails}
          open={orderDrawerOpen}
          onClose={() => {
            setOrderDrawerOpen(false);
          }}
        />
      </Box>
    </Drawer>
  );
}
