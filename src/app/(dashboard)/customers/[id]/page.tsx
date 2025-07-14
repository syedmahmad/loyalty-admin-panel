import { Box, Typography, Grid, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Person, DirectionsCar, Star } from '@mui/icons-material';

const data = {
  name: 'Ashiq Hussain',
  phone: '+966 577777770',
  joined: 'Jul 11, 2025 10:28 AM',
  status: 'Active',
  city: 'Bengaluru',
  address: '1502, West, Rajajinagar, Bengaluru, Karnataka 560010, India',
  referralCode: 'BAB580',
  loyaltyPoints: 1040,
  tier: 'Bronze',
  referralCount: 0,
  totalBurntPoints: 0,
  totalVehicles: 1,
  pointsHistory: [
    { description: 'Sign Up', points: 1000, type: 'EARN', program: 'Datamart Affiliate Program - Saudi Arabia', date: 'Jul 11, 2025 10:28 AM' },
    { description: 'Phone Number Addition', points: 20, type: 'EARN', program: 'Datamart Affiliate Program - Saudi Arabia', date: 'Jul 11, 2025 10:28 AM' },
    { description: 'Gender Addition', points: 20, type: 'EARN', program: 'Datamart Affiliate Program - Saudi Arabia', date: 'Jul 11, 2025 10:28 AM' },
  ],
  vehicles: [
    { plate: '25ZSHG', vin: '', make: 'ACURA', model: 'CL Coupe', year: 2016, fuel: 'Petrol', status: 'ACTIVE', createdAt: 'Jul 11, 2025 10:28 AM' },
  ]
};

export default function CustomerDetail() {
  return (
    <Box>
      <Typography sx={{ color: 'rgba(0, 0, 0, 0.87)',fontFamily: "Outfit, sans-serif",fontSize: '20px',fontWeight:600  }}>{data.name}</Typography>
      <Typography variant="body1" >{data.phone}</Typography>
      <Typography sx={{fontFamily:'Outfit'}}>Joined: {data.joined}</Typography>
     <Box display="flex" alignItems="center" mt={1}>
  <Typography sx={{fontFamily:'Outfit'}} mr={1}>Status:</Typography>
  <Chip label={data.status} color="primary" variant="outlined" size="small" sx={{ backgroundColor: '#fff', fontFamily: 'Outfit', fontWeight: 550  }} 
  />
</Box>
      <Typography  sx={{fontFamily:'Outfit'}} >City: {data.city}</Typography>
      <Typography sx={{fontFamily:'Outfit'}}>Location: {data.address}</Typography>
      <Typography  sx={{fontFamily:'Outfit'}}>Referral Code: {data.referralCode}</Typography>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography  sx={{fontFamily:'Outfit', opacity:0.5}}  >Loyalty Points</Typography>
            <Typography variant="h6">{data.loyaltyPoints}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{fontFamily:'Outfit', opacity:0.5}}>Tier</Typography>
            <Typography variant="h6">{data.tier}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{fontFamily:'Outfit', opacity:0.5}}>Referral Count</Typography>
            <Typography variant="h6">{data.referralCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{fontFamily:'Outfit', opacity:0.5}}>Total Burnt Points</Typography>
            <Typography variant="h6">{data.totalBurntPoints}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{fontFamily:'Outfit', opacity:0.5}}>Total Vehicle</Typography>
            <Typography variant="h6">{data.totalVehicles}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={2}>
        <Typography sx={{fontFamily:'Outfit',fontSize: '20px',fontWeight:500 }}>Points History</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Program</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.pointsHistory.map((point, idx) => (
                <TableRow key={idx}>
                  <TableCell>{point.description}</TableCell>
                  <TableCell>{point.points}</TableCell>
                  <TableCell><Chip label={point.type} color="primary" size="small" variant='outlined'sx={{ backgroundColor: '#fff', fontFamily:'Outfit',fontWeight: 550, }} /></TableCell>
                  <TableCell>{point.program}</TableCell>
                  <TableCell>{point.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mt={2}>
        <Typography sx={{fontFamily:'Outfit',fontSize: '20px',fontWeight:500 }}>Vehicle</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plate No</TableCell>
                <TableCell>VIN No</TableCell>
                <TableCell>Make</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Fuel Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.vehicles.map((v, idx) => (
                <TableRow key={idx}>
                  <TableCell>{v.plate}</TableCell>
                  <TableCell>{v.vin}</TableCell>
                  <TableCell>{v.make}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell>{v.fuel}</TableCell>
                  <TableCell><Chip label={v.status} color="primary" size="small" variant='outlined' sx={{ backgroundColor: '#fff', fontFamily:'Outfit',fontWeight: 550, }}/></TableCell>
                  <TableCell>{v.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
