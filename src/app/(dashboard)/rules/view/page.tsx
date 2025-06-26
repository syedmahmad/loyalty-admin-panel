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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GET, DELETE } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

type Rule = {
  id: number;
  name: string;
  rule_type: 'earn' | 'burn';
  min_transaction_amount?: number;
  max_points_limit: number;
  earn_conversion_factor?: number;
  burn_factor?: number;
  max_burn_percent?: number;
  min_points_to_burn?: number;
  description?: string;
};

const RuleList = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();

  const fetchRules = async () => {
    setLoading(true);
    const res = await GET('/rules');
    setRules(res?.data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await DELETE(`/rules/${deleteId}`);
    if (res?.status === 200) {
      toast.success('Rule deleted!');
      fetchRules();
    } else {
      toast.error('Failed to delete rule');
    }
    setDeleteId(null);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3, mt: 4, borderRadius: 3, width: '100%', maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        🧩 Rules List
      </Typography>

      {rules.length === 0 ? (
        <Typography mt={3} textAlign="center">
          No rules found.
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Min Txn Amount</TableCell>
                  <TableCell>Max Points</TableCell>
                  <TableCell>Conversion Factor</TableCell>
                  <TableCell>Burn Factor</TableCell>
                  <TableCell>Max Burn %</TableCell>
                  <TableCell>Min Points to Burn</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{rule.rule_type}</TableCell>
                      <TableCell>{rule.min_transaction_amount ?? '-'}</TableCell>
                      <TableCell>{rule.max_points_limit}</TableCell>
                      <TableCell>{rule.rule_type === 'earn' ? rule.earn_conversion_factor ?? '-' : '-'}</TableCell>
                      <TableCell>{rule.rule_type === 'burn' ? rule.burn_factor ?? '-' : '-'}</TableCell>
                      <TableCell>{rule.rule_type === 'burn' ? rule.max_burn_percent ?? '-' : '-'}</TableCell>
                      <TableCell>{rule.rule_type === 'burn' ? rule.min_points_to_burn ?? '-' : '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Tooltip title={rule.description || ''}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', width: '100%' }}>
                            {rule.description || '-'}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => router.push(`/rules/edit?id=${rule.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => setDeleteId(rule.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
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
            count={rules.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Are you sure you want to delete this rule?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default RuleList;
