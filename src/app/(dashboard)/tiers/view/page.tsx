'use client';

import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  TablePagination,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DELETE, GET } from '@/utils/AxiosUtility';

type Tier = {
  id: number;
  name: string;
  min_points: number;
  max_points: number;
  points_conversion_rate: number;
  benefits?: string;
  business_unit?: { name: string };
};

const TierList = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();

  const fetchTiers = async () => {
    setLoading(true);
    const res = await GET('/tiers');
    setTiers(res?.data.tiers || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await DELETE(`/tiers/${deleteId}`);
    if (res?.status === 200) {
      toast.success('Tier deleted!');
      fetchTiers();
    } else {
      toast.error('Failed to delete tier');
    }

    setDeleteId(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ width: 900, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          🎯 Tier List
        </Typography>
        <Button sx={{ mb: 2 }} variant='contained' onClick={() => router.push('create')}>
          Create Tier
        </Button>
      </Box>

      {tiers.length === 0 ? (
        <Typography mt={4} textAlign="center">
          No tiers found.
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Min Points</TableCell>
                  <TableCell>Max Points</TableCell>
                  <TableCell>Business Unit</TableCell>
                  {/* <TableCell>Points Conversion Rate</TableCell> */}
                  <TableCell>Benefits</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tiers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <Tooltip title={tier.name}>
                          <span>{tier.name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{tier.min_points}</TableCell>
                      <TableCell>{tier.max_points}</TableCell>
                      <TableCell sx={{
                          maxWidth: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          <Tooltip title={tier.business_unit?.name || '-'}>
                          <span>{tier.business_unit?.name || '-'}</span>
                        </Tooltip>
                      </TableCell>
                      {/* <TableCell>{tier.points_conversion_rate}</TableCell> */}
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Tooltip placement="top-start" title={tier.benefits || ''}>
                          <span>{tier.benefits || '-'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ display: 'flex' }}>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => router.push(`/tiers/edit?id=${tier.id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton onClick={() => setDeleteId(tier.id)}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={tiers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Are you sure you want to delete this tier?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TierList;
