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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { GET, DELETE } from '@/utils/AxiosUtility';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchValue, setSearchValue] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const router = useRouter();

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
      setNameFilter(searchValue);
      fetchCampaigns(searchValue);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchValue]);

  return (
    <Box sx={{ width: 900, mx: 'auto', mt: 4, px: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          📋 All Campaigns
        </Typography>

        <Box sx={{ gap: 1, display: 'flex' }}>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'card' | 'table')}
            size="small"
          >
            <MenuItem value="card">Card View</MenuItem>
            <MenuItem value="table">Table View</MenuItem>
          </Select>
          <Button size="small" variant="contained" onClick={() => router.push('create')}>
            Create Campaign
          </Button>
        </Box>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="Search by name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Box>

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
              <Grid item xs={12} md={6} key={campaign.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600}>
                      {campaign.name}
                    </Typography>
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
                  <CardActions>
                    <IconButton onClick={() => router.push(`/campaigns/edit?id=${campaign.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(campaign.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => {
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
                    <TableCell>
                      <IconButton onClick={() => router.push(`/campaigns/edit?id=${campaign.id}`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(campaign.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CampaignsList;
