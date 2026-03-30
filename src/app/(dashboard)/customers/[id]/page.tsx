"use client";
import GoBackButton from "@/components/buttons/GoBackButton";
import { GET, POST } from "@/utils/AxiosUtility";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
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
  Tooltip,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { qitafTransactionService, type QitafTransaction } from "@/services/qitafTransactionService";
import { toast } from "react-toastify";

export default function CustomerDetail() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params?.id); // assuming URL is like /customers/detail/[id]
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [pointSearchValue, setPointSearchValue] = useState("");
  const [couponSearchValue, setCouponSearchValue] = useState("");

  //Pagination
  const [pointPage, setPointPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const pageSize = 7;
  const [pointTotalPages, setPointTotalPages] = useState(1);
  const [couponTotalPages, setCouponTotalPages] = useState(1);

  //Assigned Coupon Pagination
  const [assignedCouponSearchQuery, setAssignedCouponSearchQuery] =
    useState("");
  const [assignedCouponPage, setAssignedCouponPage] = useState(1);
  const [assignedCouponTotalPages, setAssignedCouponTotalPages] = useState(1);
  const [customerUuid, setCustomerUuid] = useState("");
  const [bUId, setbUId] = useState<number>();
  const [assignedCoupons, setAssignedCoupons] = useState([]);

  //Usage Coupon Pagination
  const [usageCouponSearchQuery, setUsageCouponSearchQuery] = useState("");
  const [usageCouponPage, setUsageCouponPage] = useState(1);
  const [usageCouponTotalPages, setUsageCouponTotalPages] = useState(1);
  const [usageCoupons, setUsageCoupons] = useState([]);

  // STC Qitaf Transactions
  const [qitafTransactions, setQitafTransactions] = useState<QitafTransaction[]>([]);
  const [qitafPage, setQitafPage] = useState(1);
  const [qitafTotalPages, setQitafTotalPages] = useState(1);
  const [qitafLoading, setQitafLoading] = useState(false);

  const fetchCustomerDetail = async ({
    pointPage,
    couponPage,
    pointSearchValue,
    couponSearchValue,
  }: {
    pointPage: number;
    couponPage: number;
    pointSearchValue: string;
    couponSearchValue: string;
  }) => {
    try {
      const response: any = await GET(
        `/customers/${customerId}/details?pointPage=${pointPage}&couponPage=${couponPage}&pageSize=${pageSize}&point-search-query=${pointSearchValue}&coupon-search-query=${couponSearchValue}`,
      );
      setCustomer(response.data);
      setPointTotalPages(
        Math.ceil((response.data?.transactions?.total || 0) / pageSize),
      );
      setPointPage(Number(response.data?.transactions?.page));

      setCouponTotalPages(
        Math.ceil(
          (response.data?.couponTransactionInfo?.total || 0) / pageSize,
        ),
      );
      setCouponPage(Number(response.data?.couponTransactionInfo?.page));
      setbUId(response.data?.wallet?.business_unit.id);
      setCustomerUuid(response.data.uuid);
    } catch (error: any) {
      // console.error("Error fetching customer details:", error);
      const msg = error?.response?.data?.message || "Customer not found";
      toast.error(msg);
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedCoupon = async (
    customerId: string,
    bUId: number,
    assignedCouponPage: number,
    pageSize: number,
    assignedCouponSearchQuery: string,
  ) => {
    try {
      const response: any = await POST(
        `/coupons/assigned-coupons?search=${assignedCouponSearchQuery}`,
        {
          customerId,
          bUId,
          page: assignedCouponPage,
          limit: pageSize,
        },
      );
      setAssignedCoupons(response?.data?.result?.data || []);
      setAssignedCouponTotalPages(response?.data?.result?.totalPages);
      setAssignedCouponPage(response?.data?.result?.page);
    } catch (error) {
      console.log("Error");
    }
  };

  const fetchUsageCouponHistory = async (
    customerId: string,
    bUId: number,
    usageCouponPage: number,
    pageSize: number,
    usageCouponSearchQuery: string,
  ) => {
    try {
      const response: any = await POST(
        `/coupons/used-history?search=${usageCouponSearchQuery}`,
        {
          customerId,
          bUId,
          page: usageCouponPage,
          limit: pageSize,
        },
      );
      setUsageCoupons(response?.data?.result?.data || []);
      setUsageCouponTotalPages(response?.data?.result?.totalPages);
      setUsageCouponPage(response?.data?.result?.page);
    } catch (error) {
      console.log("Error");
    }
  };

  const fetchQitafTransactions = async (page: number) => {
    setQitafLoading(true);
    try {
      const result = await qitafTransactionService.getByCustomer(customerId, page, 10);
      setQitafTransactions(result.data);
      setQitafPage(result.page);
      setQitafTotalPages(result.totalPages);
    } catch {
      // No Qitaf integration for this customer — silently skip
    } finally {
      setQitafLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail({
        pointPage,
        couponPage,
        pointSearchValue,
        couponSearchValue,
      });
      fetchQitafTransactions(1);
    }
  }, [customerId, pointSearchValue, couponSearchValue]);

  useEffect(() => {
    if (bUId) {
      fetchAssignedCoupon(
        customerUuid,
        bUId,
        assignedCouponPage,
        pageSize,
        assignedCouponSearchQuery,
      );

      fetchUsageCouponHistory(
        customerUuid,
        bUId,
        usageCouponPage,
        pageSize,
        usageCouponSearchQuery,
      );
    }
  }, [bUId, customerUuid, assignedCouponSearchQuery, usageCouponSearchQuery]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <GoBackButton variant="contained" size="small" />
      <Typography
        sx={{
          color: "rgba(0, 0, 0, 0.87)",
          fontFamily: "Outfit, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
        }}
      >
        {customer?.name}
      </Typography>
      <Typography sx={{ fontFamily: "Outfit" }}>
        <strong>Phone Number:</strong> {customer?.phone?.slice(0, 10)}...
      </Typography>
      <Typography sx={{ fontFamily: "Outfit" }}>
        <strong>Joined:</strong>{" "}
        {new Date(customer?.created_at).toLocaleDateString()}
      </Typography>
      <Box display="flex" alignItems="center" mt={1}>
        <Typography sx={{ fontFamily: "Outfit" }} mr={1}>
          <strong>Status:</strong>
        </Typography>
        <Chip
          label={customer?.status === 1 ? "Active" : "Inactive"}
          color="primary"
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: "#fff",
            fontFamily: "Outfit",
            fontWeight: 550,
          }}
        />
      </Box>
      <Typography sx={{ fontFamily: "Outfit" }}>
        <strong>City:</strong> {customer?.city}
      </Typography>
      <Typography sx={{ fontFamily: "Outfit" }}>
        <strong>Location:</strong> {customer?.address}
      </Typography>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontFamily: "Outfit", opacity: 0.5 }}>
              Available Points
            </Typography>
            <Typography variant="h6">
              {customer?.wallet?.available_balance}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontFamily: "Outfit", opacity: 0.5 }}>
              Tier
            </Typography>
            <Typography variant="h6">
              {customer?.tier?.tier?.name || "N/A"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontFamily: "Outfit", opacity: 0.5 }}>
              Total Points
            </Typography>
            <Typography variant="h6">
              {customer?.wallet?.total_balance}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontFamily: "Outfit", opacity: 0.5 }}>
              Locked Points
            </Typography>
            <Typography variant="h6">
              {customer?.wallet?.locked_balance}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Points History */}
      <Box mt={2}>
        <Typography
          sx={{ fontFamily: "Outfit", fontSize: "20px", fontWeight: 500 }}
        >
          Points History
        </Typography>

        <Box mb={2} mt={1}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Outfit",
                fontWeight: 500,
                fontSize: "13px",
                color: "rgba(0, 0, 0, 0.6)",
              }}
            >
              Search Points Transactions
            </Typography>
            <Tooltip
              title="Search for point transactions by description"
              arrow
              placement="top"
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 16,
                  ml: 0.5,
                  color: "rgba(0, 0, 0, 0.4)",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Box>
          <TextField
            placeholder="Search"
            value={pointSearchValue}
            onChange={(e) => setPointSearchValue(e.target.value)}
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customer?.transactions?.data?.map((point: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{point.description}</TableCell>
                  <TableCell>{point.amount}</TableCell>
                  <TableCell>{point?.point_balance}</TableCell>
                  <TableCell>
                    <Chip
                      label={point.type}
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{
                        backgroundColor: "#fff",
                        fontFamily: "Outfit",
                        fontWeight: 550,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={point.status}
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{
                        backgroundColor: "#fff",
                        fontFamily: "Outfit",
                        fontWeight: 550,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(point.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #E0E0E0",
            paddingY: 2,
          }}
        >
          {/* Previous Button */}
          <Button
            variant="outlined"
            onClick={() =>
              fetchCustomerDetail({
                pointPage: pointPage - 1,
                couponPage,
                pointSearchValue,
                couponSearchValue,
              })
            }
            disabled={pointPage === 1}
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
            count={pointTotalPages}
            page={pointPage}
            onChange={(_, value) =>
              fetchCustomerDetail({
                pointPage: value,
                couponPage,
                pointSearchValue,
                couponSearchValue,
              })
            }
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
            onClick={() =>
              fetchCustomerDetail({
                pointPage: pointPage + 1,
                couponPage,
                pointSearchValue,
                couponSearchValue,
              })
            }
            disabled={pointPage === pointTotalPages}
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
      </Box>

      {/* Coupons History */}
      <Box mt={2}>
        <Typography
          sx={{ fontFamily: "Outfit", fontSize: "20px", fontWeight: 500 }}
        >
          Coupons History
        </Typography>

        <Box mb={2} mt={1}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Outfit",
                fontWeight: 500,
                fontSize: "13px",
                color: "rgba(0, 0, 0, 0.6)",
              }}
            >
              Search Coupon Usage History
            </Typography>
            <Tooltip
              title="Search for used coupons by invoice number"
              arrow
              placement="top"
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 16,
                  ml: 0.5,
                  color: "rgba(0, 0, 0, 0.4)",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Box>
          <TextField
            placeholder="Search"
            value={usageCouponSearchQuery}
            onChange={(e) => setUsageCouponSearchQuery(e.target.value)}
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Coupon Code</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amounts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usageCoupons?.map((singleCoupon: any, idx: number) => {
                return (
                  <TableRow key={idx}>
                    <TableCell>{singleCoupon.invoice_no}</TableCell>
                    <TableCell>{singleCoupon.code}</TableCell>
                    <TableCell>
                      {new Date(singleCoupon.used_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{singleCoupon.amount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #E0E0E0",
            paddingY: 2,
          }}
        >
          {/* Previous Button */}
          <Button
            variant="outlined"
            onClick={() => {
              if (bUId != undefined) {
                fetchUsageCouponHistory(
                  customerUuid,
                  bUId,
                  usageCouponPage - 1,
                  pageSize,
                  usageCouponSearchQuery,
                );
              }
            }}
            disabled={usageCouponPage === 1}
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
            count={usageCouponTotalPages}
            page={usageCouponPage}
            onChange={(_, value) => {
              if (bUId != undefined) {
                fetchUsageCouponHistory(
                  customerUuid,
                  bUId,
                  value,
                  pageSize,
                  usageCouponSearchQuery,
                );
              }
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
              if (bUId != undefined) {
                fetchUsageCouponHistory(
                  customerUuid,
                  bUId,
                  usageCouponPage + 1,
                  pageSize,
                  usageCouponSearchQuery,
                );
              }
            }}
            disabled={usageCouponPage === usageCouponTotalPages}
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
      </Box>

      <Box mt={2}>
        <Typography
          sx={{ fontFamily: "Outfit", fontSize: "20px", fontWeight: 500 }}
        >
          Assigned Coupons
        </Typography>

        <Box mb={2} mt={1}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Outfit",
                fontWeight: 500,
                fontSize: "13px",
                color: "rgba(0, 0, 0, 0.6)",
              }}
            >
              Search Assigned Coupons
            </Typography>
            <Tooltip
              title="Search for assigned coupons by code"
              arrow
              placement="top"
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 16,
                  ml: 0.5,
                  color: "rgba(0, 0, 0, 0.4)",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Box>
          <TextField
            placeholder="Search"
            value={assignedCouponSearchQuery}
            onChange={(e) => setAssignedCouponSearchQuery(e.target.value)}
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedCoupons?.map((singleCoupon: any, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{singleCoupon.title}</TableCell>
                    <TableCell>{singleCoupon.code}</TableCell>
                    <TableCell>
                      {new Date(singleCoupon.expiry_date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={singleCoupon.status}
                        color="primary"
                        size="small"
                        variant="outlined"
                        sx={{
                          backgroundColor: "#fff",
                          fontFamily: "Outfit",
                          fontWeight: 550,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #E0E0E0",
            paddingY: 2,
          }}
        >
          {/* Previous Button */}
          <Button
            variant="outlined"
            onClick={() => {
              if (bUId !== undefined) {
                fetchAssignedCoupon(
                  customerUuid,
                  bUId,
                  assignedCouponPage - 1,
                  pageSize,
                  assignedCouponSearchQuery,
                );
              }
            }}
            disabled={assignedCouponPage === 1}
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
            count={assignedCouponTotalPages}
            page={assignedCouponPage}
            onChange={(_, value) => {
              if (bUId !== undefined) {
                fetchAssignedCoupon(
                  customerUuid,
                  bUId,
                  value,
                  pageSize,
                  assignedCouponSearchQuery,
                );
              }
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
              if (bUId !== undefined) {
                fetchAssignedCoupon(
                  customerUuid,
                  bUId,
                  assignedCouponPage + 1,
                  pageSize,
                  assignedCouponSearchQuery,
                );
              }
            }}
            disabled={assignedCouponPage === assignedCouponTotalPages}
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
      </Box>

      {/* STC Qitaf Transactions */}
      <Box mt={2}>
        <Typography sx={{ fontFamily: "Outfit", fontSize: "20px", fontWeight: 500 }}>
          STC Qitaf Transactions
        </Typography>

        {qitafLoading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        ) : qitafTransactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" mt={1}>
            No Qitaf transactions found for this customer.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
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
                  {qitafTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Chip
                          label={tx.transaction_type}
                          size="small"
                          variant="outlined"
                          color={
                            tx.transaction_type === "earn" || tx.transaction_type === "earn_incentive"
                              ? "success"
                              : tx.transaction_type === "redeem"
                                ? "warning"
                                : tx.transaction_type === "reverse"
                                  ? "error"
                                  : "default"
                          }
                          sx={{ fontFamily: "Outfit", fontWeight: 550, textTransform: "capitalize" }}
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
                          sx={{ fontFamily: "Outfit", fontWeight: 550, textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell>{tx.amount ?? tx.reduction_amount ?? "—"}</TableCell>
                      <TableCell>{tx.points ?? "—"}</TableCell>
                      <TableCell sx={{ fontSize: "12px", color: "text.secondary" }}>
                        {tx.branch_id && tx.terminal_id
                          ? `${tx.branch_id} / ${tx.terminal_id}`
                          : "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "11px", color: "text.secondary", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

            {qitafTotalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #E0E0E0",
                  paddingY: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => fetchQitafTransactions(qitafPage - 1)}
                  disabled={qitafPage === 1}
                  sx={{ textTransform: "none", borderRadius: 2, px: 3, minWidth: 100 }}
                >
                  ← Previous
                </Button>
                <Pagination
                  count={qitafTotalPages}
                  page={qitafPage}
                  onChange={(_, value) => fetchQitafTransactions(value)}
                  shape="rounded"
                  siblingCount={1}
                  boundaryCount={1}
                  hidePrevButton
                  hideNextButton
                  sx={{ "& .MuiPaginationItem-root": { borderRadius: "8px", fontWeight: 500, minWidth: "36px", height: "36px" } }}
                />
                <Button
                  variant="outlined"
                  onClick={() => fetchQitafTransactions(qitafPage + 1)}
                  disabled={qitafPage === qitafTotalPages}
                  sx={{ textTransform: "none", borderRadius: 2, px: 3, minWidth: 100 }}
                >
                  Next →
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

// const CustomerDetail = () => {

//   if (!customer) {
//     return (
//       <Box mt={5} textAlign="center">
//         <Typography variant="h6">Customer not found</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box mt={3}>
//       <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
//         <Typography variant="h6">Customer Info</Typography>
//         <Typography>Name: {customer.name}</Typography>
//         <Typography>Email: {customer.email}</Typography>
//         <Typography>Phone: {customer.phone}</Typography>
//         <Typography>Status: {customer.status}</Typography>
//       </Paper>

//       {customer.wallet && (
//         <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
//           <Typography variant="h6">Wallet Info</Typography>
//           <Typography>Balance: {customer.wallet.balance}</Typography>
//           <Typography>Status: {customer.wallet.status}</Typography>
//         </Paper>
//       )}

//       {customer.wallet?.transactions?.length > 0 && (
//         <Paper elevation={3} sx={{ padding: 2 }}>
//           <Typography variant="h6">Transaction History</Typography>
//           {customer.wallet.transactions.map((tx: any) => (
//             <Box key={tx.id} sx={{ marginBottom: 1 }}>
//               <Typography>
//                 <strong>{tx.type.toUpperCase()}</strong> - {tx.points} points on {new Date(tx.created_at).toLocaleDateString()}
//               </Typography>
//               <Typography variant="body2">Ref: {tx.reference}</Typography>
//             </Box>
//           ))}
//         </Paper>
//       )}
//     </Box>
//   );
// };

// export default CustomerDetail;
