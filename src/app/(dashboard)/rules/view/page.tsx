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
  Pagination,
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
  const [searchName, setSearchName] = useState('');
  const [page, setPage] = useState(0);
   const count = rules.length; // your total data count

  const [rowsPerPage, setRowsPerPage] = useState(1);
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
      setNameFilter(searchName);
      fetchRules(searchName);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchName]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
   <Box sx={{ backgroundColor: '#F9FAFB', mt:"-25px"}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' , alignItems: 'center',mb:1 }}>
          <Typography
               sx={{
                 color: 'rgba(0, 0, 0, 0.87)',
                 fontFamily: 'Outfit',
                 fontSize: '32px',
                 fontWeight:600 
            

                  
               }}
             >
            Rules
             </Typography>
           <Button variant="outlined" onClick={() => router.push('/rules/view?drawer=create')}
              sx={{
       backgroundColor: '#fff',
          fontFamily:'Outfit',
         fontWeight: 600,
     
      
     }}>
             Create
           </Button>
         </Box>
      

      
        <Box mb={2}>
        <TextField
         size="small"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          sx={{
            backgroundColor: '#fff',
            fontFamily: 'Outfit',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '15px',
            lineHeight: '22px',
             borderBottom: '1px solid #e0e0e0',
            borderRadius: 2,
            '& .MuiInputBase-input': {
              fontFamily: 'Outfit',
              fontWeight: 400,
              fontSize: '15px',
              lineHeight: '22px',
              
            },
          }}
          InputProps={{ startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ color: '#9e9e9e' }} />
        </InputAdornment>
      ),
            sx: {
              borderRadius: 2,
              fontFamily: 'Outfit',
              fontWeight: 400,
            },
          }}
        />
      </Box>
      <Paper elevation={3} sx={{ borderRadius: 3, maxWidth: '100%', overflow: 'auto' }}>

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
                {rules.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      No Rule found.
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
             borderTop: '1px solid #E0E0E0', // top border line
             paddingY: 2,
             paddingX: 2,
           }}
         >
           {/* Previous Button */}
           <Button
             variant="outlined"
             onClick={() => handleChangePage(null, page - 1)}
             disabled={page === 1}
           sx={{
               textTransform: 'none',
               borderRadius: 2,
               px: 3,
               minWidth: 100
             }}
           >
             ← Previous
           </Button>
         
           {/* Pagination */}
           <Pagination
             count={count}
             page={page}
             onChange={handleChangePage}
             shape="rounded"
             siblingCount={1}
             boundaryCount={1}
             hidePrevButton
             hideNextButton
             sx={{
               '& .MuiPaginationItem-root': {
                 borderRadius: '8px',
                 fontWeight: 500,
                 minWidth: '36px',
                 height: '36px'
               }
             }}
           />
         
           {/* Next Button */}
           <Button
             variant="outlined"
             onClick={() => handleChangePage(null, page + 1)}
             disabled={page === count}
          sx={{
               textTransform: 'none',
               borderRadius: 2,
               px: 3,
               minWidth: 100
             }}
           >
             Next →
           </Button>
         </Box>
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
      </Box>
      
  );
};

export default RuleList;
