'use client'
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, TextField, InputAdornment } from '@mui/material';
import { useRouter } from 'next/navigation';
import { GET } from '@/utils/AxiosUtility';
import SearchIcon from '@mui/icons-material/Search';

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
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

  return (
    <Box px={4} py={6} sx={{backgroundColor: '#F9FAFB',mt:"-35px" }} >
      <Typography sx={{
              
              fontFamily: 'Outfit',
              fontSize: '32px',
              fontWeight:600, mb:3,}} > Active Loyalty Campaigns</Typography>
      <TextField 
        
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchCampaigns(e.target.value);
        }}
        placeholder="Search Campaigns..."
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
      <Grid container spacing={4}>
        {campaigns.map((c: any) => (
          <Grid item xs={12} sm={6} mt={3} md={4} key={c.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardContent>
                <Typography variant="h4" color="primary" fontWeight={700}>{c.name}</Typography>
                <Typography variant="body1" color="secondary" mt={1}><strong>{htmlToPlainText(c.description)}</strong></Typography>
                <Typography variant="body1" mt={1}>From: {new Date(c.start_date).toLocaleDateString()}</Typography>
                <Typography variant="body1" mt={1}>To: {new Date(c.end_date).toLocaleDateString()}</Typography>          
              </CardContent>
              <Button onClick={() => router.push(`/rewards/details?id=${c.id}`)} sx={{ m: 2 }} variant="outlined">View Details</Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CampaignList;