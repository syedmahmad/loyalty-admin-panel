"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Pagination,
  Popover,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
} from "@mui/material";
import { GET, PATCH } from "@/utils/AxiosUtility";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
type Customer = {
  tenant: any;
  id: number;
  external_customer_id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  DOB: string;
  status: number;
  city: string;
  address: string;
  business_unit: {
    name: string;
    tenant: {
      name: string;
    };
  };
};

type FetchCustomersResponse = {
  data: Customer[];
  total: number;
  page: number;
};

const fetchCustomers = async (
  search = "",
  pageSize: number,
  pageNumber: number,
  hashedNumber = "",
  status?: number
): Promise<FetchCustomersResponse> => {
  try {
    const clientInfoRaw = localStorage.getItem("client-info");
    if (!clientInfoRaw) throw new Error("Client info not found");

    const clientInfo = JSON.parse(clientInfoRaw);

    let url = `/customers/${
      clientInfo.id
    }?page=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(
      search
    )}`;

    if (hashedNumber) {
      url += `&hashed_number=${encodeURIComponent(hashedNumber)}`;
    }

    if (status !== undefined && status !== null) {
      url += `&status=${status}`;
    }

    const res = await GET(url);

    if (res?.status !== 200) throw new Error("Failed to fetch customers");

    return res.data;
  } catch (err: any) {
    if (!toast.isActive("fetch-customers-error")) {
      toast.error(
        err?.response?.data?.message ||
          "An error occurred while fetching customers",
        {
          toastId: "fetch-customers-error",
        }
      );
    }

    // Return correct empty structure according to FetchCustomersResponse
    return {
      data: [],
      total: 0,
      page: pageNumber,
    };
  }
};

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hashedNumber, setHashedNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "">("");

  // Applied filter states (used for actual API calls)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedHashedNumber, setAppliedHashedNumber] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<number | "">(
    ""
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const router = useRouter();

  const handleRowClick = (id: number | undefined) => {
    router.push(`/customers/${id}`);
  };
  const loadData = async (
    searchTerm = "",
    pageSize: number,
    pageNumber: number,
    hashedNumberParam = "",
    statusParam?: number | ""
  ) => {
    setLoading(true);
    try {
      const finalStatus = statusParam === "" ? undefined : statusParam;
      const data = await fetchCustomers(
        searchTerm,
        pageSize,
        pageNumber,
        hashedNumberParam,
        finalStatus
      );
      setCustomers(data?.data || []);
      setTotalPages(Math.ceil((data?.total || 0) / pageSize));
      setPageNumber(data.page);
    } finally {
      setLoading(false);
    }
  };

  // Handle Apply Filters button click
  const handleApplyFilters = () => {
    setAppliedSearch(search);
    setAppliedHashedNumber(hashedNumber);
    setAppliedStatusFilter(statusFilter);
    setPageNumber(1); // Reset to first page when applying new filters
  };

  // Initial load
  useEffect(() => {
    loadData(
      appliedSearch,
      pageSize,
      1,
      appliedHashedNumber,
      appliedStatusFilter
    );
  }, []);

  // Fetch data when applied filters change
  useEffect(() => {
    loadData(
      appliedSearch.trim(),
      pageSize,
      pageNumber,
      appliedHashedNumber,
      appliedStatusFilter
    );
  }, [appliedSearch, appliedHashedNumber, appliedStatusFilter, pageNumber]);

  const paginated = customers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    customer: Customer
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedCustomer) return;
    try {
      await PATCH(`/customers/${selectedCustomer.id}/status`, {
        status: selectedCustomer.status === 1 ? 0 : 1,
      });
      handleCloseMenu();
      loadData(
        appliedSearch,
        pageSize,
        pageNumber,
        appliedHashedNumber,
        appliedStatusFilter
      );
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <Box sx={{ mt: "-25px", backgroundColor: "#F9FAFB" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography
          sx={{ fontFamily: "Outfit", fontWeight: 600, fontSize: 32 }}
        >
          Customers
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
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
              Search by Name
            </Typography>
            <Tooltip
              title="Search for customers by their full name or partial name"
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
            size="small"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: "#fff",
              fontFamily: "Outfit",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "15px",
              lineHeight: "22px",
              borderBottom: "1px solid #e0e0e0",
              borderRadius: 2,
              "& .MuiInputBase-input": {
                fontFamily: "Outfit",
                fontWeight: 400,
                fontSize: "15px",
                lineHeight: "22px",
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
        </Grid>

        <Grid item xs={12} md={3}>
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
              Phone Number
            </Typography>
            <Tooltip
              title="Filter customers by their phone number, you've to enter the complete number along with country code"
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
            size="small"
            placeholder="Filter by phone number"
            value={hashedNumber}
            onChange={(e) => setHashedNumber(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: "#fff",
              fontFamily: "Outfit",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "15px",
              lineHeight: "22px",
              borderBottom: "1px solid #e0e0e0",
              borderRadius: 2,
              "& .MuiInputBase-input": {
                fontFamily: "Outfit",
                fontWeight: 400,
                fontSize: "15px",
                lineHeight: "22px",
              },
            }}
            InputProps={{
              sx: {
                borderRadius: 2,
                fontFamily: "Outfit",
                fontWeight: 400,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
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
              Customer Status
            </Typography>
            <Tooltip
              title="Filter customers by their account status: Active, Inactive, or Deleted"
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
          <FormControl
            size="small"
            fullWidth
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
            }}
          >
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as number | "")}
              label="Filter by Status"
              sx={{
                fontFamily: "Outfit",
                fontWeight: 400,
                fontSize: "15px",
                lineHeight: "22px",
                borderRadius: 2,
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={2}>Inactive</MenuItem>
              <MenuItem value={3}>Deleted</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
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
              Actions
            </Typography>
            <Tooltip
              title="Click to apply the selected filters to the customer list"
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
          <Button
            variant="contained"
            fullWidth
            onClick={handleApplyFilters}
            sx={{
              height: "37px",
              textTransform: "none",
              fontFamily: "Outfit",
              fontWeight: 500,
              fontSize: "15px",
              borderRadius: 2,
            }}
          >
            Apply Filters
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box mt={4} textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 3 }}>
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>BU</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow
                      key={c.id}
                      sx={{
                        cursor: "pointer",
                        ...(c.status === 3 && {
                          backgroundColor: "#ffebee",
                          "&:hover": {
                            backgroundColor: "#ffcdd2",
                          },
                        }),
                      }}
                    >
                      <TableCell>{c.name}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.email}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.phone}
                      </TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>
                        {c.status === 1
                          ? "Active"
                          : c.status === 2
                          ? "Inactive"
                          : c.status === 3
                          ? "Deleted"
                          : "Unknown"}
                      </TableCell>
                      <TableCell>{c.business_unit?.name || "—"}</TableCell>
                      <TableCell>{c?.tenant?.name || "—"}</TableCell>
                      <TableCell align="center">
                        {c.status === 1 ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuClick(e, c);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #E0E0E0",
                px: 2,
                py: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setPageNumber(Number(pageNumber) - 1)}
                disabled={Number(pageNumber) === 1}
              >
                ← Previous
              </Button>

              <Pagination
                count={Number(totalPages)}
                page={Number(pageNumber)}
                onChange={(_, value) => {
                  setPageNumber(value);
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

              <Button
                variant="outlined"
                onClick={() => setPageNumber(Number(pageNumber) + 1)}
                disabled={Number(pageNumber) === Number(totalPages)}
              >
                Next →
              </Button>
            </Box>
          </>
          {/* Popover for Status Toggle */}
          {selectedCustomer?.status === 1 && (
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={() => handleRowClick(selectedCustomer?.id)}>
                View Customer
              </MenuItem>
            </Popover>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CustomerList;
