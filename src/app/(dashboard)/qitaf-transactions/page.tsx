"use client";

import { useEffect, useState } from "react";
import { qitafTransactionService, type QitafTransaction } from "@/services/qitafTransactionService";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

// msisdn is stripped server-side; we still reuse the same type
type TransactionRow = Omit<QitafTransaction, "msisdn">;

export default function QitafTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const [tenantId, setTenantId] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("client-info");
    if (raw) {
      const info = JSON.parse(raw);
      if (info?.id) setTenantId(Number(info.id));
    }
  }, []);

  useEffect(() => {
    if (tenantId !== null) {
      fetchTransactions(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, page, appliedSearch]);

  const fetchTransactions = async (pageNum: number) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const result = await qitafTransactionService.getAll(
        tenantId,
        appliedSearch,
        pageNum,
        pageSize,
      );
      setTransactions(result.data as TransactionRow[]);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch Qitaf transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(phoneSearch.trim() || undefined);
  };

  const handleClear = () => {
    setPhoneSearch("");
    setAppliedSearch(undefined);
    setPage(1);
  };

  return (
    <Box p={3}>
      <Typography
        sx={{ fontFamily: "Outfit", fontSize: "24px", fontWeight: 600, mb: 3 }}
      >
        Qitaf Transactions
      </Typography>

      {/* Search bar */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          size="small"
          placeholder="Search by mobile number (e.g. +966XXXXXXXXX)"
          value={phoneSearch}
          onChange={(e) => setPhoneSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 380 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Search
        </Button>
        {appliedSearch && (
          <Button
            variant="outlined"
            onClick={handleClear}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Clear
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress size={28} />
        </Box>
      ) : transactions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" mt={2}>
          {appliedSearch
            ? "No Qitaf transactions found for this number."
            : "No Qitaf transactions found."}
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount (SAR)</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Branch / Terminal</TableCell>
                  <TableCell>Global ID</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Chip
                        label={tx.transaction_type}
                        size="small"
                        variant="outlined"
                        color={
                          tx.transaction_type === "earn" ||
                          tx.transaction_type === "earn_incentive"
                            ? "success"
                            : tx.transaction_type === "redeem"
                              ? "warning"
                              : tx.transaction_type === "reverse"
                                ? "error"
                                : "default"
                        }
                        sx={{
                          fontFamily: "Outfit",
                          fontWeight: 550,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.status}
                        size="small"
                        variant="outlined"
                        color={
                          tx.status === "success"
                            ? "success"
                            : tx.status === "auto_reversed"
                              ? "warning"
                              : "error"
                        }
                        sx={{
                          fontFamily: "Outfit",
                          fontWeight: 550,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {tx.amount ?? tx.reduction_amount ?? "—"}
                    </TableCell>
                    <TableCell>{tx.points ?? "—"}</TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "text.secondary" }}>
                      {tx.branch_id && tx.terminal_id
                        ? `${tx.branch_id} / ${tx.terminal_id}`
                        : "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "11px",
                        color: "text.secondary",
                        maxWidth: 140,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tx.global_id ?? "—"}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderTop="1px solid #E0E0E0"
            py={2}
            mt={1}
          >
            <Typography variant="body2" color="text.secondary">
              {total} transaction{total !== 1 ? "s" : ""}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
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
          </Box>
        </>
      )}
    </Box>
  );
}
