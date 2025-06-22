'use client';

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  TablePagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { GET, DELETE } from '@/utils/AxiosUtility';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

type Campaign = {
  id: number;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  budget?: number;
  is_active: boolean;
  business_unit?: { name: string };
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const router = useRouter();

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await GET('/campaigns');
    if (res?.status === 200) {
      setCampaigns(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await DELETE(`/campaigns/${deleteId}`);
    if (res?.status === 200) {
      await fetchCampaigns();
    }
    setDeleteId(null);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const paginatedData = campaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ maxWidth: '100%', p: 3, mx: 'auto', mt: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        🎯 Campaigns
      </Typography>

      {loading ? (
        <Box mt={6} textAlign="center">
          <CircularProgress />
        </Box>
      ) : campaigns.length === 0 ? (
        <Typography mt={4} textAlign="center">
          No campaigns found.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Tooltip title={campaign.name}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {campaign.name}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{campaign.type}</TableCell>
                    <TableCell>{campaign.business_unit?.name || '-'}</TableCell>
                    <TableCell>{new Date(campaign.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(campaign.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{campaign.budget || '-'}</TableCell>
                    <TableCell>{campaign.is_active ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => router.push(`/campaigns/edit?id=${campaign.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => setDeleteId(campaign.id)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2}>
         <TablePagination
            component="div"
            count={campaigns.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
          </Box>
        </>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Are you sure you want to delete this campaign?</DialogTitle>
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

export default CampaignList;
