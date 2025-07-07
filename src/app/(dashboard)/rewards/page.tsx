'use client'
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import { GET } from '@/utils/AxiosUtility';

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
    <Box px={4} py={6}>
      <Typography variant="h4" gutterBottom>🎯 Active Loyalty Campaigns</Typography>
      <TextField
        fullWidth
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchCampaigns(e.target.value);
        }}
        placeholder="Search Campaigns..."
        sx={{ mb: 3 }}
      />
      <Grid container spacing={4}>
        {campaigns.map((c: any) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
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