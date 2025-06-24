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
  type: string;
  condition_type: string;
  operator: string;
  value: number;
  reward_value?: number;
  unit_type?: string;
  description?: string;
  targets: {
    target_type: 'tier' | 'campaign';
    target_id: number;
    target_name?: string;
  }[];
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
    <Card sx={{ p: 3, mt: 4, borderRadius: 3, Width: 700, mx: 'auto' }}>
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
                  <TableCell>Type</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Reward</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((rule) => {
                    const target = rule.targets?.[0];
                    return (
                      <TableRow key={rule.id}>
                        <TableCell sx={{textTransform: 'capitalize'}}>{rule.type}</TableCell>
                        <TableCell>{rule.condition_type}</TableCell>
                        <TableCell>{rule.operator}</TableCell>
                        <TableCell>{rule.value}</TableCell>
                        <TableCell>
                          {rule.reward_value
                            ? `${rule.reward_value} ${rule.unit_type || ''}`
                            : '-'}
                        </TableCell>
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
                              onClick={() =>
                                router.push(`/rules/edit?id=${rule.id}`)
                              }
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
                    );
                  })}
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

      {/* Delete Dialog */}
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
