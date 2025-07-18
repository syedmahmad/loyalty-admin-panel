'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Popover,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  
} from 'recharts';
import {
  StaticDatePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

const LoyaltyAnalyticsPage =()=> {

const pieData = [
  { name: 'Transaction', value: 400, color: '#8BC34A' },
  { name: 'Sign up', value: 900, color: '#6A0000' },
  { name: 'Referral', value: 200, color: '#FF9800' },
  { name: 'Reference', value: 200, color: '#441e75ff' },
  { name: 'Transcation item bonus', value: 200, color: '#160f04ff' },
  { name: 'Gender addition', value: 200, color: '#d8cacaff' },
];

  const barChart= [
    { date: '2025-04-15', count: 0 },
    { date: '2025-05-01', count: 0 },
    { date: '2025-05-20', count: 8 },
    { date: '2025-06-10', count: 0 },
    { date: '2025-07-14', count: 0 },
  ];
   const barchart= [
    { date: '2025-04-15', count: 0 },
    { date: '2025-05-01', count: 4000},
    { date: '2025-05-20', count: 6000 },
    { date: '2025-06-10', count: 0 },
    { date: '2025-07-14', count: 0 },
  ];


const customerPointsData = [
  { range: '1,001-2,000', count: 213, percentage: '91.42%' },
   { range: '1,001-2,000', count: 213, percentage: '91.42%' },
    { range: '1,001-2,000', count: 213, percentage: '91.42%' },
     { range: '1,001-2,000', count: 213, percentage: '91.42%' },
      { range: '1,001-2,000', count: 213, percentage: '91.42%' },
       { range: '1,001-2,000', count: 213, percentage: '91.42%' },
       { range: '1,001-2,000', count: 213, percentage: '91.42%' },
       { range: '1,001-2,000', count: 213, percentage: '91.42%' },
       
         
];
const  itemusage=[
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
  { itemName: 'abc', Invoice: 213, percentage: '91.42%' },
];

   const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
    const [months, setMonths] = React.useState([
      dayjs(),
      dayjs().add(1, 'month'),
     
    ]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
   const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
     const handleClose = () => {
    setAnchorEl(null);
  };
  const points=[
    { label: 'Total Earned Points', count: 6235338710 },
    { label: 'Total Burnt Points', count: 0 },
    
  ];
  const inRange = (day: Dayjs) =>
    startDate && endDate && day.isAfter(startDate) && day.isBefore(endDate);
   const presets = [
    { label: 'Today', range: [dayjs(), dayjs()] },
    { label: 'Yesterday', range: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
    { label: 'Last 7 Days', range: [dayjs().subtract(6, 'day'), dayjs()] },
    { label: 'Last 30 Days', range: [dayjs().subtract(29, 'day'), dayjs()] },
    { label: 'This Month', range: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Last Month', range: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    { label: 'This Year', range: [dayjs().startOf('year'), dayjs()] },
  ];
     const handleDateClick = (day: Dayjs | null) => {
      if (!startDate || (startDate && endDate)) {
        setStartDate(day);
        setEndDate(null);
      } else if (startDate && !endDate) {
        if (day && day.isBefore(startDate)) {
          setStartDate(day);
        } else {
          setEndDate(day);
          handleClose(); 
        }
      }
    };
       const isStart = (day: Dayjs) => startDate?.isSame(day, 'day');
      const isEnd = (day: Dayjs) => endDate?.isSame(day, 'day');
     
  

  return (
    <Box mt={-2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize={25} fontWeight={600} fontFamily="Outfit">
          Loyalty Analytics
        </Typography>
        <Box display="flex" gap={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
             {/* Button shows selected range or placeholder */}
             <Button variant="outlined" onClick={handleOpen}
              sx={{
                     backgroundColor: '#fff',
                     fontFamily:'Outfit',
                     fontWeight: 500,
         
          
         }}>
               {startDate
                 ? `${startDate.format('YYYY-MM-DD')} → ${
                     endDate ? endDate.format('YYYY-MM-DD') : '…'
                   }`
                 : 'Select Date'}
             </Button>
       
             {/* Popover with sidebar + calendars */}
             <Popover
               open={open}
               anchorEl={anchorEl}
               onClose={handleClose}
               anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
             >
               <Box display="flex">
                 {/* ----- preset sidebar ----- */}
                 <List dense sx={{ width: 160, p: 0 }}>
                   {presets.map((p) => (
                     <ListItemButton
                       key={p.label}
                       onClick={() => {
                         setStartDate(p.range[0]);
                         setEndDate(p.range[1]);
                       }}
                     >
                       <ListItemText
                         primary={p.label}
                         primaryTypographyProps={{  fontSize: 14,fontWeight:'Outfit' }}
                       />
                     </ListItemButton>
                   ))}
                 </List>
       
                 <Divider orientation="vertical" flexItem />
       
                 {/* ----- calendars ----- */}
                 <Box display="flex" gap={2} p={2}>
                   {months.map((month, idx) => (
                     <StaticDatePicker
                       key={idx}
                       displayStaticWrapperAs="desktop"
                       value={month}
                       onChange={handleDateClick}
                       slots={{
                         day: (props) => {
                           const d = props.day as Dayjs;
                           const selected = isStart(d) || isEnd(d);
                           const hovered =
                             startDate &&
                             !endDate &&
                             hoverDate &&
                             d.isAfter(startDate) &&
                             d.isBefore(hoverDate);
       
                           return (
                             <PickersDay
                               {...props}
                               onClick={() => handleDateClick(d)}
                               onMouseEnter={() => setHoverDate(d)}
                               sx={{
                                 ...(selected && {
                                   bgcolor: '#d5008f',
                                   color: '#fff',
                                   borderRadius: '50%',
                                 }),
                                 ...(inRange(d) || hovered
                                   ? { bgcolor: '#f8d7f0' }
                                   : {}),
                               }}
                             />
                           );
                         },
                       }}
                     />
                   ))}
                 </Box>
               </Box>
       
               {/* ----- footer buttons ----- */}
               <Divider />
               <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
                 <Button onClick={handleClose}
                   sx={{
                     backgroundColor: '#fff',
                     fontFamily:'Outfit',
                     fontWeight: 500,
         
          
         }}>Cancel</Button>
                 <Button
                   variant="outlined"
                   disableElevation
                   onClick={handleClose}
                   disabled={!startDate || !endDate}
                     sx={{
                     backgroundColor: '#fff',
                     fontFamily:'Outfit',
                     fontWeight: 500,
         
          
         }}>
           Apply
                 </Button>
               </Box>
             </Popover>
           </LocalizationProvider>

            <Button variant='outlined'
                        sx={{
                         backgroundColor: '#fff',
                         fontFamily:'Outfit',
                         fontWeight: 500,
             
              
             }}>Export Data
                     </Button>
                     </Box>
      </Box>
<Typography variant="h4" color="secondary" >
    Total Earn Points Splits
  </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3,  }}>
           
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

       <Grid item xs={12} md={4}>
  <Typography variant="h4" color="secondary" mt={-3.5}>
    Customer by Points
  </Typography>
  <Card sx={{ borderRadius: 3, boxShadow: 3, height: 300}}>
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Table size="small" >
        <TableHead>
          <TableRow>
            <TableCell>Range</TableCell>
            <TableCell>Count</TableCell>
            <TableCell>Percentage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customerPointsData.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.range}</TableCell>
              <TableCell>{row.count}</TableCell>
              <TableCell>{row.percentage}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </Card>
</Grid>
          <Grid item xs={12} md={4}>
          <Typography variant="h4" color="secondary" mt={-3.5}>Item Usage (Data Mart)</Typography>
          <Card sx={{ borderRadius: 3, boxShadow: 3,height: 300 }}>
             <Box sx={{ height: '100%', overflow: 'auto' }}>
             <Table size="small" >
              <TableHead>
                <TableRow>
                  <TableCell>Item Name </TableCell>
                  <TableCell>Invoice </TableCell>
                  <TableCell>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemusage.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.itemName}</TableCell>
                    <TableCell>{row.Invoice}</TableCell>
                    <TableCell>{row.percentage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
              </Box>
          </Card>
        </Grid>
      </Grid>
       <Typography  variant="h4" color="secondary"  p={1}   
        >
               Loyalty Point Summary
             </Typography>
     <Grid container spacing={2} mb={2}>
             {points.map((item, index) => (
               <Grid item xs={12} sm={6} md={3} key={index}>
                 <Card sx={{ p: 1, borderRadius: 3, boxShadow: 3 }}>
                   <Box display="flex">
                     <Box
                       sx={{
                         color: '#fff',
                         borderRadius: '10px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                       fontFamily:'Outfit',
                      fontWeight: 400
                      }}>
                    </Box>
                     <Box>
                       <Typography fontWeight={600}>{item.label}</Typography>
                       <Typography variant="h6">{item.count}</Typography>
                     </Box>
                   </Box>
                 </Card>
               </Grid>
             ))}
           </Grid>
           <Typography  variant="h4" color="secondary"  p={1}   
        >
               Total Earn & Burn Points
             </Typography>
       
      <Grid item xs={12} md={6}>
  <Box p={2} sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#fff' }}>
    
    {/* Top Center Label */}
    <Box display="flex" justifyContent="center" mb={2}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        <Box component="span" sx={{ color: '#2196f3', mr: 1 }}>● Earned Points</Box>
        <Box component="span" sx={{ color: '#f44336' }}>● Burnt Points</Box>
      </Typography>
    </Box>

     <ResponsiveContainer width="100%" height={500}>
  <BarChart data={barChart}> {/* You can rename lineData to barData if preferred */}
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />

    <XAxis
      dataKey="date"
      label={{
        value: 'Date',
        position: 'insideBottom',
        offset: -5,
        style: { textAnchor: 'middle' }
      }}
    />

    <YAxis
      domain={[0, 10]}
      ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      label={{
        value: 'Points',
        angle: -90,
        position: 'insideLeft',
        offset: 0,
        style: { textAnchor: 'middle' }
      }}
    /><Tooltip />
    <Bar dataKey="count" fill="#2196f3" stroke="#2196f3" strokeWidth={1} name="Points" />
  </BarChart>
</ResponsiveContainer>

  </Box>
</Grid>
<Typography  variant="h4" color="secondary"  p={1}   
        >
               Total Transaction Frequency
             </Typography>

   <Grid item xs={12} md={6}>
  <Box p={2} sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#fff' }}>
    
    {/* Top Center Label */}
    <Box display="flex" justifyContent="center" mb={2}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        <Box component="span" sx={{ color: '#be7d1bff', mr: 1 }}>● Transaction Amount</Box>
        
      </Typography>
    </Box>

     <ResponsiveContainer width="100%" height={500}>
  <BarChart data={barchart}> {/* You can rename lineData to barData if preferred */}
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />

    <XAxis
      dataKey="date"
      label={{
        value: 'Date',
        position: 'insideBottom',
        offset: -5,
        style: { textAnchor: 'middle' }
      }}
    />

    <YAxis
      domain={[0, 8000]}
      ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000 ]}
      label={{
        value: 'Amount',
        angle: -90,
        position: 'insideLeft',
        offset: 0,
        style: { textAnchor: 'middle' }
      }}
    /><Tooltip />
    <Bar dataKey="count" fill="#e2a41dff" stroke="#cfb230ff" strokeWidth={1} name="Points" />
  </BarChart>
</ResponsiveContainer>

  </Box>
</Grid>


    </Box>
  );
}
export default LoyaltyAnalyticsPage;