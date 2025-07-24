'use client';
import { Box, Typography, Grid, Paper, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Person, DirectionsCar, Star } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GET } from '@/utils/AxiosUtility';

export default function CustomerDetail() {
  const params = useParams();
  const customerId = Number(params?.id); // assuming URL is like /customers/detail/[id]
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        const response: any = await GET(`/customers/${customerId}/details`);
        setCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customer details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerDetail();
    }
  }, [customerId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("customer", customer);
  
  return (
    <Box>
      <Typography sx={{ color: 'rgba(0, 0, 0, 0.87)',fontFamily: "Outfit, sans-serif",fontSize: '20px',fontWeight:600  }}>{customer.name}</Typography>
      <Typography sx={{fontFamily:'Outfit'}}>
        <strong>Phone Number:</strong> {customer.phone?.slice(0, 10)}...
      </Typography>
      <Typography sx={{fontFamily:'Outfit'}}><strong>Joined:</strong> {new Date(customer.created_at).toLocaleDateString()}</Typography>
      <Box display="flex" alignItems="center" mt={1}>
        <Typography sx={{fontFamily:'Outfit'}} mr={1}><strong>Status:</strong></Typography>
        <Chip label={customer.status === 1 ? "Active" : "Inactive"} color="primary" variant="outlined" size="small" sx={{ backgroundColor: '#fff', fontFamily: 'Outfit', fontWeight: 550  }} 
        />
      </Box>
      <Typography  sx={{fontFamily:'Outfit'}} ><strong>City:</strong> {customer.city}</Typography>
      <Typography sx={{fontFamily:'Outfit'}}><strong>Location:</strong> {customer.address}</Typography>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography  sx={{fontFamily:'Outfit', opacity:0.5}}  >Available Points</Typography>
            <Typography variant="h6">{customer.wallet?.available_balance}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{fontFamily:'Outfit', opacity:0.5}}>Tier</Typography>
            <Typography variant="h6">1</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography  sx={{fontFamily:'Outfit', opacity:0.5}}  >Total Points</Typography>
            <Typography variant="h6">{customer.wallet?.total_balance}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography  sx={{fontFamily:'Outfit', opacity:0.5}}  >Locked Points</Typography>
            <Typography variant="h6">{customer.wallet?.locked_balance}</Typography>
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
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customer.transactions.map((point: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{point.description}</TableCell>
                  <TableCell>{point.amount}</TableCell>
                  <TableCell><Chip label={point.type} color="primary" size="small" variant='outlined'sx={{ backgroundColor: '#fff', fontFamily:'Outfit',fontWeight: 550, }} /></TableCell>
                  <TableCell>{new Date(point.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Box>
  );
}



// const CustomerDetail = () => {

//   if (!customer) {
//     return (
//       <Box mt={5} textAlign="center">
//         <Typography variant="h6">Customer not found</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box mt={3}>
//       <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
//         <Typography variant="h6">Customer Info</Typography>
//         <Typography>Name: {customer.name}</Typography>
//         <Typography>Email: {customer.email}</Typography>
//         <Typography>Phone: {customer.phone}</Typography>
//         <Typography>Status: {customer.status}</Typography>
//       </Paper>

//       {customer.wallet && (
//         <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
//           <Typography variant="h6">Wallet Info</Typography>
//           <Typography>Balance: {customer.wallet.balance}</Typography>
//           <Typography>Status: {customer.wallet.status}</Typography>
//         </Paper>
//       )}

//       {customer.wallet?.transactions?.length > 0 && (
//         <Paper elevation={3} sx={{ padding: 2 }}>
//           <Typography variant="h6">Transaction History</Typography>
//           {customer.wallet.transactions.map((tx: any) => (
//             <Box key={tx.id} sx={{ marginBottom: 1 }}>
//               <Typography>
//                 <strong>{tx.type.toUpperCase()}</strong> - {tx.points} points on {new Date(tx.created_at).toLocaleDateString()}
//               </Typography>
//               <Typography variant="body2">Ref: {tx.reference}</Typography>
//             </Box>
//           ))}
//         </Paper>
//       )}
//     </Box>
//   );
// };

// export default CustomerDetail;
