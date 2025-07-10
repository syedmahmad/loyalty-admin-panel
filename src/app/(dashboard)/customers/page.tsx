'use client';

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { GET, PATCH } from '@/utils/AxiosUtility';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';

type Customer = {
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

const fetchCustomers = async (search = ''): Promise<Customer[]> => {
  const res = await GET(`/customers?search=${encodeURIComponent(search)}`);
  if (res?.status !== 200) throw new Error('Failed to fetch customers');
  return res.data;
};

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const loadData = async (searchTerm = '') => {
    setLoading(true);
    try {
      const data = await fetchCustomers(searchTerm);
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => loadData(search.trim()), 300);
    return () => clearTimeout(delay);
  }, [search]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const paginated = customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleToggleStatus = async () => {
    if (selectedCustomer) {
      await PATCH(`/customers/${selectedCustomer.id}/status`, {
        status: selectedCustomer.status === 1 ? 0 : 1,
      });
      handleCloseMenu();
      loadData(search);
    }
  };

  return (
    <Box sx={{ mt: '-25px', backgroundColor: '#F9FAFB' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 32 }}>
          Customers
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ backgroundColor: '#fff', borderRadius: 2, mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#9e9e9e' }} />
            </InputAdornment>
          ),
        }}
      />

      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box mt={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
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
                  {paginated.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>{c.status === 1 ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>{c.business_unit?.name || '—'}</TableCell>
                      <TableCell>{c.business_unit?.tenant?.name || '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuClick(e, c)}>
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #E0E0E0',
                px: 2,
                py: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => handleChangePage(null, page - 1)}
                disabled={page === 0}
              >
                ← Previous
              </Button>

              <Pagination
                count={Math.ceil(customers.length / rowsPerPage)}
                page={page + 1}
                onChange={(_, p) => setPage(p - 1)}
                shape="rounded"
                hidePrevButton
                hideNextButton
              />

              <Button
                variant="outlined"
                onClick={() => handleChangePage(null, page + 1)}
                disabled={(page + 1) * rowsPerPage >= customers.length}
              >
                Next →
              </Button>
            </Box>
          </>
        )}

        {/* Popover for Status Toggle */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleToggleStatus}>
            {selectedCustomer?.status === 1 ? 'Deactivate' : 'Activate'} Customer
          </MenuItem>
        </Popover>
      </Paper>
    </Box>
  );
};

export default CustomerList;
