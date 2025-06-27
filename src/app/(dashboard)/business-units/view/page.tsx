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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import { useRouter } from 'next/navigation';
import { DELETE, GET } from '@/utils/AxiosUtility';

type BusinessUnit = {
  id: number;
  name: string;
  description?: string;
  location?: string;
};

const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const response = await GET('/business-units');
  if (response?.status !== 200) {
    throw new Error('Failed to fetch business units');
  }
  return response.data;
};

const deleteBusinessUnit = async (id: number): Promise<void> => {
  const response = await DELETE(`/business-units/${id}`);
  if (response?.status !== 200) {
    throw new Error('Failed to delete business unit');
  }
  return response.data;
};

const BusinessUnitList = () => {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBusinessUnits();
      setUnits(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId !== null) {
      await deleteBusinessUnit(confirmDeleteId);
      setConfirmDeleteId(null);
      await loadData();
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    loadData();
  }, []);

  const paginatedUnits = units.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          🏢 Business Units
        </Typography>
        <Button sx={{ mb: 2 }} variant='contained' onClick={() => router.push('create')}>
          Create Business Units
        </Button>
      </Box>

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
                  <TableCell align="center">
                    <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Name
                  </TableCell>
                  <TableCell align="center">
                    <DescriptionIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Description
                  </TableCell>
                  <TableCell align="center">
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Location
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell align="center">{unit.name}</TableCell>
                    <TableCell align="center">{unit.description || '—'}</TableCell>
                    <TableCell align="center">{unit.location || '—'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton
                          color="primary"
                          onClick={() => router.push(`/business-units/edit?id=${unit.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => setConfirmDeleteId(unit.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {units.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No business units found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={units.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      <Dialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>Are you sure you want to delete this business unit?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BusinessUnitList;
