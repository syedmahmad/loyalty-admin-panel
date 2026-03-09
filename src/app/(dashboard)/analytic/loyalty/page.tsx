"use client";

import { GET } from "@/utils/AxiosUtility"; // Axios wrapper
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LoyaltyAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<any>({
    pointSplits: [],
    customerByPoints: [],
    itemUsage: [],
    summary: {
      totalEarnedPoints: 0,
      totalBurntPoints: 0,
      totalNotConfirmedBurntPoints: 0,
      totalLoyaltyPoints: 0,
      totalRemainingPoints: 0,
    },
    nonClaimed: {
      unclaimedCount: 0,
      totalAmount: 0,
      estimatedPoints: 0,
      pointsPerSar: 0,
    },
  });

  const [loadingPointSplits, setLoadingPointSplits] = useState(true);
  const [loadingCustomerByPoints, setLoadingCustomerByPoints] = useState(true);
  const [loadingItemUsage, setLoadingItemUsage] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingBarChart, setLoadingBarChart] = useState(true);
  const [loadingNonClaimed, setLoadingNonClaimed] = useState(true);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const months = [dayjs(), dayjs().add(1, "month")];

  const resetData = () => {
    setAnalyticsData({
      pointSplits: [],
      customerByPoints: [],
      itemUsage: [],
      summary: {
        totalEarnedPoints: 0,
        totalBurntPoints: 0,
        totalNotConfirmedBurntPoints: 0,
        totalLoyaltyPoints: 0,
        totalRemainingPoints: 0,
      },
      barChart: [],
      nonClaimed: {
        unclaimedCount: 0,
        totalAmount: 0,
        estimatedPoints: 0,
        pointsPerSar: 0,
      },
    });
    setLoadingPointSplits(true);
    setLoadingCustomerByPoints(true);
    setLoadingItemUsage(true);
    setLoadingSummary(true);
    setLoadingBarChart(true);
    setLoadingNonClaimed(true);
  };

  const fetchPointSplits = async () => {
    try {
      setLoadingPointSplits(true);
      const response = await GET("/loyalty/analytics/get-point-splits", {
        params: {
          startDate: startDate?.format("YYYY-MM-DD"),
          endDate: endDate?.format("YYYY-MM-DD"),
        },
      });
      setAnalyticsData((prev: any) => ({
        ...prev,
        pointSplits: response?.data?.pointSplits,
      }));
    } catch (error: any) {
      console.error("Error loading point splits data:", error);
      if (!toast.isActive("fetch-loyalty-analytics-error")) {
        toast.error(
          error?.response?.data?.message || "Failed to load point splits",
          { toastId: "fetch-loyalty-analytics-error" }
        );
      }
    } finally {
      setLoadingPointSplits(false);
    }
  };

  const fetchCustomerByPoints = async () => {
    try {
      setLoadingCustomerByPoints(true);
      const response = await GET("/loyalty/analytics/customer-by-points");
      setAnalyticsData((prev: any) => ({
        ...prev,
        customerByPoints: response?.data?.customerByPoints,
      }));
    } catch (error: any) {
      console.error("Error loading customer points data:", error);
      if (!toast.isActive("fetch-loyalty-analytics-error")) {
        toast.error(
          error?.response?.data?.message || "Failed to load customer by points",
          { toastId: "fetch-loyalty-analytics-error" }
        );
      }
    } finally {
      setLoadingCustomerByPoints(false);
    }
  };

  const fetchPointSummary = async () => {
    try {
      setLoadingSummary(true);
      const response = await GET("/loyalty/analytics/get-point-summary", {
        params: {
          startDate: startDate?.format("YYYY-MM-DD"),
          endDate: endDate?.format("YYYY-MM-DD"),
        },
      });
      setAnalyticsData((prev: any) => ({
        ...prev,
        summary: response?.data?.summary,
      }));
    } catch (error: any) {
      console.error("Error loading points summary data:", error);
      if (!toast.isActive("fetch-loyalty-analytics-error")) {
        toast.error(
          error?.response?.data?.message || "Failed to load point summary",
          { toastId: "fetch-loyalty-analytics-error" }
        );
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchItemUsage = async () => {
    try {
      setLoadingItemUsage(true);
      const response = await GET("/loyalty/analytics/get-item-usage", {
        params: {
          startDate: startDate?.format("YYYY-MM-DD"),
          endDate: endDate?.format("YYYY-MM-DD"),
        },
      });
      setAnalyticsData((prev: any) => ({
        ...prev,
        itemUsage: response?.data?.itemUsage,
      }));
    } catch (error: any) {
      console.error("Error loading item usage data:", error);
      if (!toast.isActive("fetch-loyalty-analytics-error")) {
        toast.error(
          error?.response?.data?.message || "Failed to load earn activity",
          { toastId: "fetch-loyalty-analytics-error" }
        );
      }
    } finally {
      setLoadingItemUsage(false);
    }
  };

  const fetchBarChart = async () => {
    try {
      setLoadingBarChart(true);
      const response = await GET("/loyalty/analytics/get-bar-chart", {
        params: {
          startDate: startDate?.format("YYYY-MM-DD"),
          endDate: endDate?.format("YYYY-MM-DD"),
        },
      });
      setAnalyticsData((prev: any) => ({
        ...prev,
        barChart: response?.data?.barChart,
      }));
    } catch (error: any) {
      console.error("Error loading barChart data:", error);
      if (!toast.isActive("fetch-loyalty-analytics-error")) {
        toast.error(
          error?.response?.data?.message || "Failed to load bar chart",
          { toastId: "fetch-loyalty-analytics-error" }
        );
      }
    } finally {
      setLoadingBarChart(false);
    }
  };

  const fetchNonClaimedPoints = async () => {
    try {
      setLoadingNonClaimed(true);
      const response = await GET("/loyalty/analytics/non-claimed-points", {
        params: {
          startDate: startDate?.format("YYYY-MM-DD"),
          endDate: endDate?.format("YYYY-MM-DD"),
        },
      });
      setAnalyticsData((prev: any) => ({
        ...prev,
        nonClaimed: response?.data,
      }));
    } catch (error: any) {
      console.error("Error loading non-claimed points data:", error);
      if (!toast.isActive("fetch-loyalty-analytics-error")) {
        toast.error(
          error?.response?.data?.message || "Failed to load non-claimed points",
          { toastId: "fetch-loyalty-analytics-error" }
        );
      }
    } finally {
      setLoadingNonClaimed(false);
    }
  };

  useEffect(() => {
    fetchPointSplits();
    fetchCustomerByPoints();
    fetchPointSummary();
    fetchItemUsage();
    fetchBarChart();
    fetchNonClaimedPoints();
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
    if (!day) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day.isBefore(startDate)) {
        setStartDate(day);
      } else {
        setEndDate(day);
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
    "#2196F3",
    "#E91E63",
    "#00BCD4",
    "#FF5722",
    "#9C27B0",
    "#4CAF50",
    "#FFC107",
    "#3F51B5",
    "#009688",
    "#F44336",
    "#607D8B",
    "#FFEB3B",
    "#795548",
    "#673AB7",
  ];

  const pieData =
    analyticsData?.pointSplits?.map((split: any, idx: number) => ({
      name: split.sourceType,
      value: Number(split.totalPoints),
      color: chartColors[idx % chartColors.length],
    })) || [];

  const customerPointsData = analyticsData.customerByPoints || [];

  const itemusage = analyticsData.itemUsage || [];

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
      label: "Not Confirmed Burnt Points",
      count: analyticsData.summary.totalNotConfirmedBurntPoints,
    },
    {
      label: "Remaining Points in Wallets",
      count: analyticsData.summary.totalRemainingPoints,
    },
  ];

  const handleExport = () => {
    const { summary, pointSplits, customerByPoints, itemUsage, barChart } =
      analyticsData;

    const csvSections = [];

    // Summary
    csvSections.push(["Summary"]);
    csvSections.push(["Label", "Value"]);
    csvSections.push(["Total Earned Points", summary.totalEarnedPoints]);
    csvSections.push(["Total Burnt Points", summary.totalBurntPoints]);
    csvSections.push(["Not Confirmed Burnt Points", summary.totalNotConfirmedBurntPoints]);
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

    // Earn Activity by Source Type
    csvSections.push(["Earn Activity by Source Type"]);
    csvSections.push(["Source Type", "Transactions", "Total Points"]);
    itemUsage.forEach((item: any) => {
      csvSections.push([item.sourceType, item.transactionCount, item.totalPoints]);
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

  const SectionLoader = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" minHeight={100}>
      <CircularProgress size={28} />
    </Box>
  );

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
                      value={null}
                      referenceDate={month}
                      onChange={() => {}}
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
                    handleClose();
                    resetData();
                    fetchPointSplits();
                    fetchCustomerByPoints();
                    fetchPointSummary();
                    fetchItemUsage();
                    fetchBarChart();
                    fetchNonClaimedPoints();
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

      <Typography variant="h4" color="secondary" mb={1}>
        Total Earn Points Splits
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column" }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, flex: 1, overflow: "visible" }}>
            {loadingPointSplits ? (
              <SectionLoader />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={110}
                    label={false}
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      Number(value).toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      }),
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column" }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, flex: 1, display: "flex", flexDirection: "column" }}>
            <Box px={2} pt={2}>
              <Typography variant="h4" color="secondary" mb={1}>
                Customer by Points
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {loadingCustomerByPoints ? (
                <SectionLoader />
              ) : (
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
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column" }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, flex: 1, display: "flex", flexDirection: "column" }}>
            <Box px={2} pt={2}>
              <Typography variant="h4" color="secondary" mb={1}>
                Earn Activity by Source Type
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {loadingItemUsage ? (
                <SectionLoader />
              ) : itemusage.length === 0 ? (
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
                      <TableCell>Source Type</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itemusage.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{row.sourceType}</TableCell>
                        <TableCell align="right">
                          {Number(row.transactionCount).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {Number(row.totalPoints).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
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
            <Card sx={{ p: 1, borderRadius: 3, boxShadow: 3, minHeight: 72 }}>
              {loadingSummary ? (
                <SectionLoader />
              ) : (
                <Box>
                  <Typography fontWeight={600}>{item.label}</Typography>
                  <Typography variant="h6">
                    {Number(item.count).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" color="secondary" p={1}>
        Total Earn & Burn Points
      </Typography>
      <Box
        p={2}
        sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: "#fff", minHeight: 120 }}
      >
        {loadingBarChart ? (
          <SectionLoader />
        ) : !analyticsData.barChart?.length ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={100}>
            <Typography variant="body2" color="text.secondary">
              No chart data available
            </Typography>
          </Box>
        ) : (
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
        )}
      </Box>

      <Typography variant="h4" color="secondary" p={1} mt={2}>
        Non Claimed Points
      </Typography>
      <Grid container spacing={2} mb={2}>
        {[
          {
            label: "Unclaimed Invoices",
            value: analyticsData.nonClaimed?.unclaimedCount ?? 0,
            format: "count",
          },
          {
            label: "Total Invoice Amount (SAR)",
            value: analyticsData.nonClaimed?.totalAmount ?? 0,
            format: "decimal",
          },
          {
            label: "Estimated Unclaimed Points",
            value: analyticsData.nonClaimed?.estimatedPoints ?? 0,
            format: "count",
          },
          {
            label: "Earning Rate",
            value: analyticsData.nonClaimed?.pointsPerSar ?? 0,
            format: "rate",
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, minHeight: 80 }}>
              {loadingNonClaimed ? (
                <SectionLoader />
              ) : (
                <Box>
                  <Typography fontWeight={600} color="text.secondary" fontSize={13}>
                    {item.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {item.format === "decimal"
                      ? Number(item.value).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : item.format === "rate"
                      ? `${Number(item.value).toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                        })} pts / SAR`
                      : Number(item.value).toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LoyaltyAnalyticsPage;
