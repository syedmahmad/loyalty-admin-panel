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
  TextField,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DELETE, GET } from '@/utils/AxiosUtility';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import BaseDrawer from '@/components/drawer/basedrawer';
import TierCreate from '../create/page';
import TierEdit from '../edit/page';

type Tier = {
  id: number;
  name: string;
  min_points: number;
  points_conversion_rate: number;
  benefits?: string;
  business_unit?: { name: string };
};

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
};

const TierList = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();
  const searchParams = useSearchParams();
  const drawerOpen = searchParams.get('drawer');
  const drawerId = searchParams.get('id');
  const handleCloseDrawer = () => {
    router.push('/tiers/view');
  };
  const fetchTiers = async (name = '') => {
    setLoading(true);
    const clientInfo = JSON.parse(localStorage.getItem('client-info')!);
    const res = await GET(`/tiers/${clientInfo.id}?name=${encodeURIComponent(name)}`);
    setTiers(res?.data?.tiers || []);
    setLoading(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setTimeout(() => {
      fetchTiers(value);
    }, 300);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await DELETE(`/tiers/${deleteId}`);
    if (res?.status === 200) {
      toast.success('Tier deleted!');
      fetchTiers(search);
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

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" , mb:2 }}>
        <Typography
                    sx={{
                      color: 'rgba(0, 0, 0, 0.87)',
                      fontFamily: 'Outfit',
                      fontSize: '32px',
                      fontWeight: 600,
                    }}
                  >
                    Tier List
                  </Typography>
        <Button variant='outlined' onClick={() => router.push('/tiers/view?drawer=create')}
            sx={{ fontWeight: 600, textTransform: 'none' }}>
          Create 
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="Search by name"
          value={search}
          onChange={handleSearchChange}
        />
      </Box>

      {loading ? (
        <Box textAlign="center" mt={6}><CircularProgress /></Box>
      ) : tiers.length === 0 ? (
        <Typography mt={4} textAlign="center">No tiers found.</Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Min Points</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell>Benefits</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tiers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <Tooltip title={tier.name}><span>{tier.name}</span></Tooltip>
                    </TableCell>
                    <TableCell>{tier.min_points}</TableCell>
                    <TableCell>
                      <Tooltip title={tier.business_unit?.name || '-'}>
                        <span>{tier.business_unit?.name || '-'}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={
                          <span
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(marked.parse(tier.benefits || '-') as string),
                            }}
                          />
                        }
                      >
                        <span>{htmlToPlainText(tier.benefits || '-')}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => router.push(`/tiers/view?drawer=edit&id=${tier.id}`)}>
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
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Drawer for Create */}
      <BaseDrawer open={drawerOpen === 'create'} onClose={handleCloseDrawer} title="Create Tier">
        <TierCreate
          onSuccess={() => {
            handleCloseDrawer();
            fetchTiers();
          }}
        />
      </BaseDrawer>

      {/* Drawer for Edit */}
      {drawerOpen === 'edit' && drawerId && (
        <BaseDrawer open onClose={handleCloseDrawer} title="Edit Tier">
          <TierEdit
            onSuccess={() => {
              handleCloseDrawer();
              fetchTiers();
            }}
          />
        </BaseDrawer>
)};
    </Paper>
  );
};

export default TierList;
