"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
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
} from "@mui/material";
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
} from "recharts";
import { StaticDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { GET } from "@/utils/AxiosUtility"; // Axios wrapper
import { toast } from "react-toastify";

const LoyaltyAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<any>({
    pointSplits: [],
    customerByPoints: [],
    itemUsage: [],
    summary: {
      totalEarnedPoints: 0,
      totalBurntPoints: 0,
      totalLoyaltyPoints: 0,
      totalRemainingPoints: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const months = [dayjs(), dayjs().add(1, "month")];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await GET("/loyalty/analytics/dashboard", {
        params: {
          startDate: startDate?.format("YYYY-MM-DD"),
          endDate: endDate?.format("YYYY-MM-DD"),
        },
      });
      setAnalyticsData(response?.data);
    } catch (error: any) {
      console.error("Error loading analytics data:", error);
      if (!toast.isActive("fetch-loyalty-analytics-error")) {
        toast.error(
          error?.response?.data?.message ||
            "An error occurred while editing the rule",
          {
            toastId: "fetch-loyalty-analytics-error",
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const inRange = (day: Dayjs) =>
    startDate && endDate && day.isAfter(startDate) && day.isBefore(endDate);

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

  const isStart = (day: Dayjs) => startDate?.isSame(day, "day");
  const isEnd = (day: Dayjs) => endDate?.isSame(day, "day");

  const presets = [
    { label: "Today", range: [dayjs(), dayjs()] },
    {
      label: "Yesterday",
      range: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
    },
    { label: "Last 7 Days", range: [dayjs().subtract(6, "day"), dayjs()] },
    { label: "Last 30 Days", range: [dayjs().subtract(29, "day"), dayjs()] },
    {
      label: "This Month",
      range: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
    {
      label: "Last Month",
      range: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    { label: "This Year", range: [dayjs().startOf("year"), dayjs()] },
  ];

  const chartColors = [
    "#8BC34A",
    "#6A0000",
    "#FF9800",
    "#441e75ff",
    "#160f04ff",
    "#d8cacaff",
  ];

  const pieData =
    analyticsData?.pointSplits?.map((split: any, idx: number) => ({
      name: split.sourceType,
      value: Number(split.totalPoints),
      color: chartColors[idx % chartColors.length],
    })) || [];

  const customerPointsData = analyticsData.customerByPoints || [];

  const itemusage = analyticsData.itemUsage.map((item: any) => ({
    itemName: item.itemName,
    Invoice: item.invoiceCount,
    percentage: item.percentage,
  }));

  const points = [
    {
      label: "Total Earned Points",
      count: analyticsData.summary.totalEarnedPoints,
    },
    {
      label: "Total Burnt Points",
      count: analyticsData.summary.totalBurntPoints,
    },
    {
      label: "Remaining Points in Wallets",
      count: analyticsData.summary.totalRemainingPoints,
    },
  ];

  if (loading) {
    return <Typography>Loading Loyalty Analytics...</Typography>;
  }

  const handleExport = () => {
    const { summary, pointSplits, customerByPoints, itemUsage, barChart } =
      analyticsData;

    const csvSections = [];

    // Summary
    csvSections.push(["Summary"]);
    csvSections.push(["Label", "Value"]);
    csvSections.push(["Total Earned Points", summary.totalEarnedPoints]);
    csvSections.push(["Total Burnt Points", summary.totalBurntPoints]);
    csvSections.push(["Net Loyalty Points", summary.totalLoyaltyPoints]);
    csvSections.push([
      "Remaining Points in Wallets",
      summary.totalRemainingPoints,
    ]);
    csvSections.push([]); // Empty line

    // Point Splits
    csvSections.push(["Point Splits"]);
    csvSections.push(["Source Type", "Total Points"]);
    pointSplits.forEach((ps: any) => {
      csvSections.push([ps.sourceType, ps.totalPoints]);
    });
    csvSections.push([]);

    // Customer by Points
    csvSections.push(["Customer by Points"]);
    csvSections.push(["Range", "Count", "Percentage"]);
    customerByPoints.forEach((cp: any) => {
      csvSections.push([cp.range, cp.count, cp.percentage]);
    });
    csvSections.push([]);

    // Item Usage
    csvSections.push(["Item Usage"]);
    csvSections.push(["Item Name", "Invoice Count", "Percentage"]);
    itemUsage.forEach((item: any) => {
      csvSections.push([item.itemName, item.invoiceCount, item.percentage]);
    });
    csvSections.push([]);

    // Bar Chart
    csvSections.push(["Bar Chart (Earn & Burn Points)"]);
    csvSections.push(["Date", "Earned", "Burnt"]);
    barChart?.forEach((entry: any) => {
      csvSections.push([entry.date, entry.earned, entry.burnt]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvSections.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "loyalty-analytics-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box mt={-2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography fontSize={25} fontWeight={600} fontFamily="Outfit">
          Loyalty Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Button variant="outlined" onClick={handleOpen}>
              {startDate
                ? `${startDate.format("YYYY-MM-DD")} → ${
                    endDate ? endDate.format("YYYY-MM-DD") : "…"
                  }`
                : "Select Date"}
            </Button>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <Box display="flex">
                <List dense sx={{ width: 160, p: 0 }}>
                  {presets.map((p) => (
                    <ListItemButton
                      key={p.label}
                      onClick={() => {
                        setStartDate(p.range[0]);
                        setEndDate(p.range[1]);
                      }}
                    >
                      <ListItemText primary={p.label} />
                    </ListItemButton>
                  ))}
                </List>
                <Divider orientation="vertical" flexItem />
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
                                  bgcolor: "#d5008f",
                                  color: "#fff",
                                  borderRadius: "50%",
                                }),
                                ...(inRange(d) || hovered
                                  ? { bgcolor: "#f8d7f0" }
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
              <Divider />
              <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleClose(), fetchAnalytics();
                  }}
                  disabled={!startDate || !endDate}
                >
                  Apply
                </Button>
              </Box>
            </Popover>
          </LocalizationProvider>
          <Button variant="outlined" onClick={handleExport}>
            Export Data
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" color="secondary">
        Total Earn Points Splits
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100} label>
                  {pieData.map((entry: any, index: number) => (
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
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: 300 }}>
            <Box sx={{ height: "100%", overflow: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Range</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerPointsData.map((row: any, idx: number) => (
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
          <Typography variant="h4" color="secondary" mt={-3.5}>
            Item Usage (Data Mart)
          </Typography>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: 300 }}>
            <Box sx={{ height: "100%", overflow: "auto" }}>
              {itemusage.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No Data Available
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itemusage.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{row.itemName}</TableCell>
                        <TableCell>{row.Invoice}</TableCell>
                        <TableCell>{row.percentage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h4" color="secondary" p={1}>
        Loyalty Point Summary
      </Typography>
      <Grid container spacing={2} mb={2}>
        {points.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ p: 1, borderRadius: 3, boxShadow: 3 }}>
              <Box>
                <Typography fontWeight={600}>{item.label}</Typography>
                <Typography variant="h6">{item.count}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {analyticsData.barChart?.length > 0 ? (
        <Grid item xs={12}>
          <Typography variant="h4" color="secondary" p={1}>
            Total Earn & Burn Points
          </Typography>
          <Box
            p={2}
            sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: "#fff" }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.barChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earned" fill="#4caf50" name="Earned Points" />
                <Bar dataKey="burnt" fill="#f44336" name="Burnt Points" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Typography variant="h4" color="secondary" p={1}>
            Total Earn & Burn Points
          </Typography>
          <Box
            p={2}
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              backgroundColor: "#fff",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No chart data available
            </Typography>
          </Box>
        </Grid>
      )}
    </Box>
  );
};

export default LoyaltyAnalyticsPage;
