"use client";

import { GET } from "@/utils/AxiosUtility";
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
  Tooltip as MuiTooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface QitafSummary {
  totalRedemptions: number;
  totalAmount: number;
  avgAmount: number;
  earn: {
    totalEarns: number;
    totalAmount: number;
    avgAmount: number;
  };
}

interface QitafBarEntry {
  date: string | null;
  count: number;
  amount: number;
  earnCount: number;
  earnAmount: number;
}

const SectionLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
    <CircularProgress size={28} />
  </Box>
);

export default function QitafAnalyticPage() {
  const [summary, setSummary] = useState<QitafSummary>({
    totalRedemptions: 0,
    totalAmount: 0,
    avgAmount: 0,
    earn: { totalEarns: 0, totalAmount: 0, avgAmount: 0 },
  });
  const [barChart, setBarChart] = useState<QitafBarEntry[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingBarChart, setLoadingBarChart] = useState(true);

  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(1, "year"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const months = [dayjs(), dayjs().add(1, "month")];

  const presets = [
    { label: "Today", range: [dayjs(), dayjs()] },
    { label: "Yesterday", range: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")] },
    { label: "Last 7 Days", range: [dayjs().subtract(6, "day"), dayjs()] },
    { label: "Last 30 Days", range: [dayjs().subtract(29, "day"), dayjs()] },
    { label: "This Month", range: [dayjs().startOf("month"), dayjs().endOf("month")] },
    { label: "Last Month", range: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
    { label: "This Year", range: [dayjs().startOf("year"), dayjs()] },
  ];

  const inRange = (day: Dayjs) =>
    startDate && endDate && day.isAfter(startDate) && day.isBefore(endDate);

  const isStart = (day: Dayjs) => startDate?.isSame(day, "day");
  const isEnd = (day: Dayjs) => endDate?.isSame(day, "day");

  const handleDateClick = (day: Dayjs | null) => {
    if (!day) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day.isBefore(startDate)) setStartDate(day);
      else setEndDate(day);
    }
  };

  const dateParams = {
    startDate: startDate?.format("YYYY-MM-DD"),
    endDate: endDate?.format("YYYY-MM-DD"),
  };

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await GET("/loyalty/analytics/qitaf/summary", { params: dateParams });
      setSummary(res?.data ?? { totalRedemptions: 0, totalAmount: 0, avgAmount: 0, earn: { totalEarns: 0, totalAmount: 0, avgAmount: 0 } });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load Qitaf summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchBarChart = async () => {
    setLoadingBarChart(true);
    try {
      const res = await GET("/loyalty/analytics/qitaf/bar-chart", { params: dateParams });
      setBarChart(res?.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load Qitaf chart");
    } finally {
      setLoadingBarChart(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchBarChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    setAnchorEl(null);
    fetchSummary();
    fetchBarChart();
  };

  const handleExport = () => {
    const q = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const fmtDec = (n: any) =>
      Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const dateRangeLabel =
      startDate && endDate
        ? `${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`
        : "All Time";

    const rows: any[][] = [
      [q("STC Qitaf Analytics Export")],
      [q("Exported On"), q(dayjs().format("YYYY-MM-DD HH:mm:ss"))],
      [q("Date Range"), q(dateRangeLabel)],
      [],
      [q("Redemption Summary")],
      [q("Total Redemptions"), q(summary.totalRedemptions)],
      [q("Total Amount (SAR)"), q(fmtDec(summary.totalAmount))],
      [q("Avg. Amount per Transaction (SAR)"), q(fmtDec(summary.avgAmount))],
      [],
      [q("Earn Summary")],
      [q("Total Earns"), q(summary.earn.totalEarns)],
      [q("Total Earn Amount (SAR)"), q(fmtDec(summary.earn.totalAmount))],
      [q("Avg. Earn Amount per Transaction (SAR)"), q(fmtDec(summary.earn.avgAmount))],
      [],
      [q("Daily Transactions")],
      [q("Date"), q("Redeem Transactions"), q("Redeem Amount (SAR)"), q("Earn Transactions"), q("Earn Amount (SAR)")],
      ...barChart.map((r) => [q(r.date), q(r.count), q(fmtDec(r.amount)), q(r.earnCount), q(fmtDec(r.earnAmount))]),
    ];

    const BOM = "\uFEFF";
    const csv = BOM + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `qitaf-analytics_${startDate?.format("YYYY-MM-DD") ?? "all"}_${endDate?.format("YYYY-MM-DD") ?? "all"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      label: "Total Redemption Amount (SAR)",
      value: Number(summary.totalAmount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      tooltip: "Total SAR redeemed through STC Qitaf (excludes reversed transactions).",
    },
    {
      label: "Total Redemptions",
      value: Number(summary.totalRedemptions).toLocaleString("en-US", { maximumFractionDigits: 0 }),
      tooltip: "Count of successful redeem transactions, net of any reversals.",
    },
    {
      label: "Avg. Amount per Redemption (SAR)",
      value: Number(summary.avgAmount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      tooltip: "Average SAR value per redemption transaction.",
    },
  ];

  const earnCards = [
    {
      label: "Total Earn Amount (SAR)",
      value: Number(summary.earn.totalAmount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      tooltip: "Total SAR value of points earned through STC Qitaf.",
    },
    {
      label: "Total Earns",
      value: Number(summary.earn.totalEarns).toLocaleString("en-US", { maximumFractionDigits: 0 }),
      tooltip: "Count of successful earn transactions.",
    },
    {
      label: "Avg. Earn Amount (SAR)",
      value: Number(summary.earn.avgAmount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      tooltip: "Average SAR value per earn transaction.",
    },
  ];

  return (
    <Box mt={-2}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontSize={25} fontWeight={600} fontFamily="Outfit">
          STC Qitaf Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Button variant="outlined" onClick={(e) => setAnchorEl(e.currentTarget)}>
              {startDate
                ? `${startDate.format("YYYY-MM-DD")} → ${endDate ? endDate.format("YYYY-MM-DD") : "…"}`
                : "Select Date"}
            </Button>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
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
                                ...(selected && { bgcolor: "#d5008f", color: "#fff", borderRadius: "50%" }),
                                ...(inRange(d) || hovered ? { bgcolor: "#f8d7f0" } : {}),
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
                <Button onClick={() => setAnchorEl(null)}>Cancel</Button>
                <Button
                  variant="outlined"
                  onClick={handleApply}
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

      {/* Summary Cards */}
      <Typography variant="h4" color="secondary" mb={1}>
        Redemption Summary
      </Typography>
      <Grid container spacing={2} mb={3}>
        {summaryCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, minHeight: 80 }}>
              {loadingSummary ? (
                <SectionLoader />
              ) : (
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography fontWeight={600} color="text.secondary" fontSize={13}>
                      {card.label}
                    </Typography>
                    <MuiTooltip title={card.tooltip} placement="top" arrow>
                      <InfoOutlinedIcon sx={{ fontSize: 15, color: "text.secondary", cursor: "pointer" }} />
                    </MuiTooltip>
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {card.value}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Info note about points */}
      <Box
        mb={3}
        p={1.5}
        sx={{
          borderRadius: 2,
          backgroundColor: "#f0f4ff",
          border: "1px solid #c5d5f5",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 18, color: "#5c7cfa" }} />
        <Typography fontSize={13} color="text.secondary">
          To estimate equivalent Qitaf points, multiply the redemption amount (SAR) by your STC
          redemption factor (e.g., if 1 SAR = 5 pts, multiply total amount × 5).
        </Typography>
      </Box>

      {/* Bar Chart — Redemptions */}
      <Typography variant="h4" color="secondary" mb={1}>
        Daily Redemptions (SAR)
      </Typography>
      <Box
        p={2}
        mb={4}
        sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: "#fff", minHeight: 120 }}
      >
        {loadingBarChart ? (
          <SectionLoader />
        ) : !barChart.some((r) => r.count > 0) ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={100}>
            <Typography variant="body2" color="text.secondary">
              No redemption data available for this period
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: any, name: string) =>
                  name === "Amount (SAR)"
                    ? [Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), name]
                    : [Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }), name]
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="amount" name="Amount (SAR)" fill="#d5008f" />
              <Bar yAxisId="right" dataKey="count" name="Transactions" fill="#441e75" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* Earn Summary Cards */}
      <Typography variant="h4" color="secondary" mb={1}>
        Earn Summary
      </Typography>
      <Grid container spacing={2} mb={3}>
        {earnCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, minHeight: 80 }}>
              {loadingSummary ? (
                <SectionLoader />
              ) : (
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography fontWeight={600} color="text.secondary" fontSize={13}>
                      {card.label}
                    </Typography>
                    <MuiTooltip title={card.tooltip} placement="top" arrow>
                      <InfoOutlinedIcon sx={{ fontSize: 15, color: "text.secondary", cursor: "pointer" }} />
                    </MuiTooltip>
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {card.value}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bar Chart — Earns */}
      <Typography variant="h4" color="secondary" mb={1}>
        Daily Earns (SAR)
      </Typography>
      <Box
        p={2}
        sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: "#fff", minHeight: 120 }}
      >
        {loadingBarChart ? (
          <SectionLoader />
        ) : !barChart.some((r) => r.earnCount > 0) ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={100}>
            <Typography variant="body2" color="text.secondary">
              No earn data available for this period
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: any, name: string) =>
                  name === "Earn Amount (SAR)"
                    ? [Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), name]
                    : [Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }), name]
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="earnAmount" name="Earn Amount (SAR)" fill="#00897b" />
              <Bar yAxisId="right" dataKey="earnCount" name="Earn Transactions" fill="#00564f" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
