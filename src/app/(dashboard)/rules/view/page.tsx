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
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { GET, DELETE } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import RuleCreateForm from '../create/page';
import RuleEdit from '../edit/page';
import BaseDrawer from '@/components/drawer/basedrawer';

type Rule = {
  id: number;
  name: string;
  rule_type: 'event based earn' | 'spend and earn' | 'burn' | 'dynamic rule';
  min_amount_spent?: number;
  reward_points?: number;
  event_triggerer?: string;
  max_redeemption_points_limit?: number;
  points_conversion_factor?: number;
  max_burn_percent_on_invoice?: number;
  condition_type?: string;
  condition_operator?: string;
  condition_value?: string;
  description?: string;
};

const RuleList = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
    const searchParams = useSearchParams();
  const drawerOpen = searchParams.get('drawer');
  const drawerId = searchParams.get('id');

  const router = useRouter();

  const fetchRules = async (name = '') => {
    setLoading(true);
    const clientInfo = JSON.parse(localStorage.getItem('client-info')!);
    const query = name ? `?name=${encodeURIComponent(name)}` : '';
    const res = await GET(`/rules/${clientInfo.id}${query}`);
    setRules(res?.data || []);
    setLoading(false);
  };
  const handleCloseDrawer = () => {
    const currentUrl = window.location.pathname;
    router.push(currentUrl);
  };
  //  const fetchRules = async () => {
  //   setLoading(true);
  //   const res = await GET('/rules');
  //   setRules(res?.data || []);
  //   setLoading(false);
  // };

  

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await DELETE(`/rules/${deleteId}`);
    if (res?.status === 200) {
      toast.success('Rule deleted!');
      fetchRules(nameFilter);
    } else {
      toast.error('Failed to delete rule');
    }
    setDeleteId(null);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setNameFilter(searchValue);
      fetchRules(searchValue);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchValue]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
     <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: '100%', overflow: 'auto' }}>
     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" ,mb:2 }}>
        <Typography
                    sx={{
                      color: 'rgba(0, 0, 0, 0.87)',
                      fontFamily: 'Outfit',
                      fontSize: '32px',
                      fontWeight: 600,
                    }}
                  >
                    Rules 
                  </Typography>
        <Button variant="outlined" onClick={() =>router.push('/rules/view?drawer=create')}
          sx={{ fontWeight: 600, textTransform: 'none' }} >
          Create Rule
        </Button>
      </Box>

      <Box mt={2} mb={2}>
        <TextField
          size="medium"
          placeholder="Search by name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box mt={4} textAlign="center">
          <CircularProgress />
        </Box>
      ) : rules.length === 0 ? (
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
                  <TableCell>Min Spend</TableCell>
                  <TableCell>Reward Points</TableCell>
                  <TableCell>Event Trigger</TableCell>
                  <TableCell>Condition Type</TableCell>
                  <TableCell>Condition Operator</TableCell>
                  <TableCell>Condition Value</TableCell>
                  <TableCell>Max Redeem Points</TableCell>
                  <TableCell>Conversion Factor</TableCell>
                  <TableCell>Max Burn %</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{rule.rule_type}</TableCell>
                    <TableCell>{rule.min_amount_spent ?? '-'}</TableCell>
                    <TableCell>{rule.reward_points ?? '-'}</TableCell>
                    <TableCell>{rule.rule_type === 'event based earn' ? rule.event_triggerer || '-' : '-'}</TableCell>
                    <TableCell>{rule.rule_type === 'dynamic rule' ? rule.condition_type || '-' : '-'}</TableCell>
                    <TableCell>{rule.rule_type === 'dynamic rule' ? rule.condition_operator || '-' : '-'}</TableCell>
                    <TableCell>{rule.rule_type === 'dynamic rule' ? rule.condition_value || '-' : '-'}</TableCell>
                    <TableCell>{rule.rule_type === 'burn' ? rule.max_redeemption_points_limit ?? '-' : '-'}</TableCell>
                    <TableCell>{rule.rule_type === 'burn' ? rule.points_conversion_factor ?? '-' : '-'}</TableCell>
                    <TableCell>{rule.rule_type === 'burn' ? rule.max_burn_percent_on_invoice ?? '-' : '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => router.push(`/rules/view?drawer=edit&id=${rule.id}`)
                        }>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => setDeleteId(rule.id)} color="error">
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
          <Button onClick={() => setDeleteId(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    
    {/* Drawer for Create */}
      <BaseDrawer
        open={drawerOpen === 'create'}
        onClose={handleCloseDrawer}
        title="Create Rule"
      >
        <RuleCreateForm onSuccess={() => {
          handleCloseDrawer(); 
          fetchRules(); 
    }}/>
      </BaseDrawer>

      {/* Drawer for Edit */}
      {drawerOpen === 'edit' && drawerId && (
        <BaseDrawer
          open={true}
          onClose={handleCloseDrawer}
          title="Edit Rule"
        >
          <RuleEdit onSuccess={() => {
          handleCloseDrawer(); 
          fetchRules(); 
    }}/>
        </BaseDrawer>
      )}
      </Paper>
  );
};

export default RuleList;
