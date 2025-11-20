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
} from "@mui/material";
import { GET, PATCH } from "@/utils/AxiosUtility";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  status: 0 | 1;
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
  pageNumber: number
): Promise<FetchCustomersResponse> => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const res = await GET(
    `/customers/${
      clientInfo.id
    }?page=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(
      search
    )}`
  );
  if (res?.status !== 200) throw new Error("Failed to fetch customers");
  return res.data;
};

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const handleRowClick = (id: number) => {
    router.push(`/customers/${id}`);
  };
  const loadData = async (
    searchTerm = "",
    pageSize: number,
    pageNumber: number
  ) => {
    setLoading(true);
    try {
      const data = await fetchCustomers(searchTerm, pageSize, pageNumber);
      setCustomers(data?.data || []);
      setTotalPages(Math.ceil((data?.total || 0) / pageSize));
      setPageNumber(data.page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(
      () => loadData(search.trim(), pageSize, pageNumber),
      300
    );
    return () => clearTimeout(delay);
  }, [search]);

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
      loadData(search, pageSize, pageNumber);
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

      <TextField
        size="small"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 2,
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
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow
                      key={c.id}
                      onClick={() => handleRowClick(c.id)}
                      sx={{ cursor: "pointer" }}
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
                        {c.status === 1 ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell>{c.business_unit?.name || "—"}</TableCell>
                      <TableCell>{c?.tenant?.name || "—"}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, c);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
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
                onClick={() =>
                  loadData(search, pageSize, Number(pageNumber) - 1)
                }
                disabled={Number(pageNumber) === 1}
              >
                ← Previous
              </Button>

              <Pagination
                count={Number(totalPages)}
                page={Number(pageNumber)}
                onChange={(_, value) => {
                  setPageNumber(value);
                  loadData(search, pageSize, value);
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
                onClick={() =>
                  loadData(search, pageSize, Number(pageNumber) + 1)
                }
                disabled={Number(pageNumber) === Number(totalPages)}
              >
                Next →
              </Button>
            </Box>
          </>
          {/* Popover for Status Toggle */}
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
            <MenuItem onClick={handleToggleStatus}>
              {selectedCustomer?.status === 1 ? "Deactivate" : "Activate"}{" "}
              Customer
            </MenuItem>
          </Popover>
        </Paper>
      )}
    </Box>
  );
};

export default CustomerList;
