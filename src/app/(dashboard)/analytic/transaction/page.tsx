'use client';

import {
  Box,
  Button,
  Divider,List,ListItemButton,ListItemText,
  Card,
  Grid,
  Typography,
  Popover,
} from '@mui/material';
import {
  LocalizationProvider,
  StaticDatePicker,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

import {
 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import React from 'react';


const TransactionAnalyticsPage = () => {

  
   const set = [
    { label: 'Total Items Sold', count: 0, },
    { label: 'Total Services Sold', count: 0  },
    { label:'Total Jobcard Invoices',count:0},
    { label:'Total Unique Keys Spare',count:0 }
   
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
  const inRange = (day: Dayjs) =>
  startDate && endDate && day.isAfter(startDate) && day.isBefore(endDate);

  const presets: { label: string; range: [Dayjs, Dayjs] }[] = [
    { label: 'Today',        range: [dayjs(), dayjs()] },
    { label: 'Yesterday',    range: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
    { label: 'Last 7 Days',  range: [dayjs().subtract(6, 'day'), dayjs()] },
    { label: 'Last 30 Days', range: [dayjs().subtract(29, 'day'), dayjs()] },
    { label: 'Last 90 Days', range: [dayjs().subtract(89, 'day'), dayjs()] },
    { label: 'This Month',   range: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Last Month',   range: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    { label: 'This Year',    range: [dayjs().startOf('year'), dayjs()] },
    { label: 'All Time',     range: [dayjs('2000-01-01'), dayjs()] },
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
 
const lineData = [
    { date: '2025-04-15', count: 0 },
    { date: '2025-05-01', count: 0 },
    { date: '2025-05-20', count: 0 },
    { date: '2025-06-10', count: 0 },
    { date: '2025-07-14', count: 0 },
  ];
    

  return (
    <Box >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
              sx={{
              color: 'rgba(0, 0, 0, 0.87)',
              fontFamily: 'Outfit',
              fontSize: '25px',
              fontWeight:600 ,
               
               
            }} >
          Transaction Analytics
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
  }}>
    Export Data
          </Button>
        </Box>
      </Box>
      <Typography variant="h4" color="secondary" >
        Transactions Stats
      </Typography>
       <Grid container spacing={2} mb={2}>
        {set.map((item, index) => (
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
                  }}
                ></Box>
                <Box>
                  <Typography variant="h5" color="secondary" >{item.label}</Typography>
                  <Typography variant="h6">{item.count}</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
     <Typography variant="h4" color="secondary" >
       Top Moving Services
     </Typography>
        <Grid pt={2}>
        <Grid item xs={12} md={6}>
          <Box p={2} sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#fff' }}>
         
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={lineData}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="date" 
                
                 label={{
    value: 'Date',              
    position: 'insideBottom',  
    offset: -5,                 
    style: { textAnchor: 'middle' }
  }}
                />
                <YAxis domain={[0, 1.0]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,0.9,1.0]} 
                 label={{
                  value: 'Total Service Sold',   
                           angle: -90,               
                         position: 'insideLeft',    
                          offset: 0,                
                         style: { textAnchor: 'middle' } 
  }}/> 
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2196f3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionAnalyticsPage;
