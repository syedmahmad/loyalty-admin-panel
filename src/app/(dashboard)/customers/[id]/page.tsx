"use client";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Person, DirectionsCar, Star } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GET } from "@/utils/AxiosUtility";
import GoBackButton from "@/components/buttons/GoBackButton";

export default function CustomerDetail() {
  const params = useParams();
  const customerId = Number(params?.id); // assuming URL is like /customers/detail/[id]
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [searchValue, setSearchValue] = useState("");

  //Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomerDetail = async (
    pageNumber: number,
    searchValue: string
  ) => {
    try {
      const response: any = await GET(
        `/customers/${customerId}/details?page=${pageNumber}&pageSize=${pageSize}&query=${searchValue}`
      );

      setCustomer(response.data);
      setTotalPages(
        Math.ceil((response.data?.transactions?.total || 0) / pageSize)
      );
      setPage(Number(response.data?.transactions?.page));
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail(page, searchValue);
    }
  }, [customerId, searchValue]);

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
        {customer.name}
      </Typography>
      <Typography sx={{ fontFamily: "Outfit" }}>
        <strong>Phone Number:</strong> {customer.phone?.slice(0, 10)}...
      </Typography>
      <Typography sx={{ fontFamily: "Outfit" }}>
        <strong>Joined:</strong>{" "}
        {new Date(customer.created_at).toLocaleDateString()}
      </Typography>
      <Box display="flex" alignItems="center" mt={1}>
        <Typography sx={{ fontFamily: "Outfit" }} mr={1}>
          <strong>Status:</strong>
        </Typography>
        <Chip
          label={customer.status === 1 ? "Active" : "Inactive"}
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
        <strong>City:</strong> {customer.city}
      </Typography>
      <Typography sx={{ fontFamily: "Outfit" }}>
        <strong>Location:</strong> {customer.address}
      </Typography>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontFamily: "Outfit", opacity: 0.5 }}>
              Available Points
            </Typography>
            <Typography variant="h6">
              {customer.wallet?.available_balance}
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
              {customer.wallet?.total_balance}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontFamily: "Outfit", opacity: 0.5 }}>
              Locked Points
            </Typography>
            <Typography variant="h6">
              {customer.wallet?.locked_balance}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={2}>
        <Typography
          sx={{ fontFamily: "Outfit", fontSize: "20px", fontWeight: 500 }}
        >
          Points History
        </Typography>

        <Box mb={2} mt={1}>
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customer?.transactions?.data?.map((point: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{point.description}</TableCell>
                  <TableCell>{point.amount}</TableCell>
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
            onClick={() => fetchCustomerDetail(page - 1, searchValue)}
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
            onChange={(_, value) => fetchCustomerDetail(value, searchValue)}
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
            onClick={() => fetchCustomerDetail(page + 1, searchValue)}
            disabled={page === totalPages}
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
          Coupons History
        </Typography>

        <Box mb={2} mt={1}>
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Source Type</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customer?.transactions?.data?.map((point: any, idx: number) => {
                if (point.source_type !== 'coupon') return null;
                return(
                  <TableRow key={idx}>
                    <TableCell>{point.description}</TableCell>
                    <TableCell>{point.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={point.source_type}
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
                )})}
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
            onClick={() => fetchCustomerDetail(page - 1, searchValue)}
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
            onChange={(_, value) => fetchCustomerDetail(value, searchValue)}
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
            onClick={() => fetchCustomerDetail(page + 1, searchValue)}
            disabled={page === totalPages}
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
