'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { GET, DELETE } from '@/utils/AxiosUtility';
import { useRouter ,useSearchParams} from 'next/navigation';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';
import BaseDrawer from '@/components/drawer/basedrawer';
import CampaignCreateForm from '../create/page';
import CampaignEdit from '../edit/page';

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [searchName, setSearchValue] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const router = useRouter();
   const [rowsPerPage, setRowsPerPage] = useState(7);
  const [page, setPage] = useState(0);
   const count = campaigns.length;
   const totalPages = Math.ceil(count / rowsPerPage);
    const searchParams = useSearchParams();
  const drawerOpen = searchParams.get('drawer');
  const drawerId = searchParams.get('id');
   const handleCloseDrawer = () => {
    const currentUrl = window.location.pathname;
    router.push(currentUrl);
  };

  const fetchCampaigns = async (name = '') => {
    setLoading(true);
    const clientInfo = JSON.parse(localStorage.getItem('client-info')!);
    const query = name ? `?name=${encodeURIComponent(name)}` : '';
    const res = await GET(`/campaigns/${clientInfo.id}${query}`);
    if (res?.data) {
      setCampaigns(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);
 const handleChangePage = (_: unknown, newPage: number) => setPage(newPage-1);
 const campaignss = campaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const handleDelete = async (id: number) => {
    const confirm = window.confirm('Are you sure you want to delete this campaign?');
    if (!confirm) return;

    try {
      const res = await DELETE(`/campaigns/${id}`);
      if (res?.status === 200) {
        toast.success('Campaign deleted!');
        fetchCampaigns(nameFilter);
      } else {
        toast.error('Failed to delete campaign');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      setNameFilter(searchName);
      fetchCampaigns(searchName);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchName]);

  return (
    <Box sx={{ backgroundColor: '#F9FAFB',mt:"-25px" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
                  sx={{
                        color: 'rgba(0, 0, 0, 0.87)',
                        fontFamily: 'Outfit',
                        fontSize: '32px',
                        fontWeight: 600,
                        }}
                        >
                             All Campaigns
                            </Typography>
                  

        <Box sx={{ gap: 1, display: 'flex' }}>
         
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'card' | 'table')}
            size="small"
             sx={{ backgroundColor: '#fff',
             fontFamily:'Outfit',
        fontWeight: 600,}}
          >
            <MenuItem value="card" >Card View</MenuItem>
            <MenuItem value="table">Table View</MenuItem>
          </Select>
          <Button size="small" variant="outlined" onClick={() => router.push('/campaigns/view?drawer=create')}
              sx={{ backgroundColor: '#fff',
             fontFamily:'Outfit',
        fontWeight: 600,
   }}>
            Create 
          </Button>
        </Box>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="Search by name"
           value={searchName}
          onChange={(e) => setSearchValue(e.target.value)}
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
    InputProps={{
      startAdornment: (
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
      <Paper elevation={3} sx={{ borderRadius: 3, maxWidth: '100%', overflow: 'auto', boxShadow: 'none',border : 'none',transition : 'none', bgcolor : '#fafafb', pb : 2 }}>

      {loading ? (

        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'card' ? (
        <Grid container spacing={3}>
          {campaigns.map((campaign) => {
            const ruleNames = campaign.rules?.map((r: any) => r.rule?.name).join(', ') || 'No Rules';
            const tierNames = campaign.tiers?.map((t: any) => t.tier?.name).join(', ') || 'No Tiers';

            return (
              <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                 
                         <Card
                           sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'none',border : 'none',transition : 'none' }}>
                    <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , boxShadow: 'none',transition : 'none'}}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {campaign.name}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton  onClick={() =>router.push(`/campaigns/view?drawer=edit&id=${campaign.id}`)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(campaign.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        BU: {campaign.business_unit?.name || 'N/A'}
                      </Typography>
                    <Typography variant="body2">
                      {dayjs(campaign.start_date).format('MMM D, YYYY')} -{' '}
                      {dayjs(campaign.end_date).format('MMM D, YYYY')}
                    </Typography>
                    <Box mt={1}>
                      <Tooltip title={ruleNames}>
                        <Chip label={`Rules: ${campaign.rules?.length || 0}`} sx={{ mr: 1 }} />
                      </Tooltip>
                      <Tooltip title={tierNames}>
                        <Chip label={`Tiers: ${campaign.tiers?.length || 0}`} />
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
                
              </Grid>
            );
          })}
        </Grid>
      
      ) : (
        <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Business Unit</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Rules</TableCell>
                <TableCell>Tiers</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaignss.map((campaign) => {
                const ruleNames = campaign.rules?.map((r: any) => r.rule?.name).join(', ') || 'No Rules';
                const tierNames = campaign.tiers?.map((t: any) => t.tier?.name).join(', ') || 'No Tiers';

                return (
                  
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.business_unit?.name || 'N/A'}</TableCell>
                    <TableCell>{dayjs(campaign.start_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell>{dayjs(campaign.end_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell>
                      <Tooltip title={ruleNames}>
                        <span>{campaign.rules?.length || 0}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={tierNames}>
                        <span>{campaign.tiers?.length || 0}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                     <IconButton onClick={() =>router.push(`/campaigns/view?drawer=edit&id=${campaign.id}`)}>
                     <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(campaign.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
               {campaigns.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} align="center">
                                    No campaigns found.
                                  </TableCell>
                                </TableRow>
                              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box component={Paper}
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
            onClick={() => setPage(prev => prev - 1)}
  disabled={page === 0}
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
            count={totalPages}
            page={page+1}
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
             disabled={page === totalPages - 1} 
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
       {/* Drawer for Create */}
      <BaseDrawer
        open={drawerOpen === 'create'}
        onClose={handleCloseDrawer}
        title="Create Campaign"
      >
        <CampaignCreateForm
          onSuccess={() => {
            handleCloseDrawer();
            fetchCampaigns();
          }}
        />
      </BaseDrawer>

      {/* Drawer for Edit */}
      {drawerOpen === 'edit' && drawerId && (
        <BaseDrawer
          open={true}
          onClose={handleCloseDrawer}
          title="Edit Campaign"
        >
          <CampaignEdit
            onSuccess={() => {
              handleCloseDrawer();
              fetchCampaigns();
            }}
          />
        </BaseDrawer>
      )}
    </Paper>
    </Box>
  );
};

export default CampaignsList;
