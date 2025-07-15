"use client";

import BaseDrawer from "@/components/drawer/basedrawer";
import { DELETE, GET } from "@/utils/AxiosUtility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CouponCreate from "../create/page";
import CouponEdit from "../edit/page";
import { htmlToPlainText } from "@/utils/Index";
import { COUPON_TYPE } from "@/constants/constants";
import SearchIcon from "@mui/icons-material/Search";

type Coupon = {
  coupon_title: string;
  id: number;
  code: string;
  discount_percentage: string;
  discount_price: number;
  business_unit?: { name: string };
  usage_limit: number;
  number_of_times_used: number;
  benefits?: string;
};

const CouponList = () => {
  const [search, setSearch] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [drawerWidth, setDrawerWidth] = useState(1100);
  const count = coupons.length;
  const totalPages = Math.ceil(count / rowsPerPage);
  const router = useRouter();
  const searchParams = useSearchParams();
  const drawerOpen = searchParams.get("drawer");
  const drawerId = searchParams.get("id");
  const handleCloseDrawer = () => {
    router.push("/coupons/view");
  };

  const fetchCoupons = async (name = "") => {
    setLoading(true);
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(
      `/coupons/${clientInfo.id}?name=${encodeURIComponent(name)}`
    );
    setCoupons(res?.data.coupons || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await DELETE(`/coupons/${deleteId}`);
    if (res?.status === 200) {
      toast.success("Coupon deleted!");
      fetchCoupons(search);
    } else {
      toast.error("Failed to delete coupon");
    }

    setDeleteId(null);
  };

  const handleChangePage = (_: unknown, newPage: number) =>
    setPage(newPage - 1);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setTimeout(() => {
      fetchCoupons(value);
    }, 300);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  const handleDrawerWidth = (selectedCouponType: string) => {
    setDrawerWidth(
      // selectedCouponType === COUPON_TYPE.VEHICLE_SPECIFIC ? 900 : 700
      1100
    );
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", mt: "-25px" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          sx={{
            color: "rgba(0, 0, 0, 0.87)",
            fontFamily: "Outfit",
            fontSize: "32px",
            fontWeight: 600,
          }}
        >
          Coupon List
        </Typography>
        <Box sx={{ gap: 1, display: "flex" }}>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "card" | "table")}
            size="small"
            sx={{
              backgroundColor: "#fff",
              fontFamily: "Outfit",
              fontWeight: 600,
            }}
          >
            <MenuItem value="card">Card View</MenuItem>
            <MenuItem value="table">Table View</MenuItem>
          </Select>
          <Button
            variant="outlined"
            onClick={() => router.push("/coupons/view?drawer=create")}
            sx={{
              backgroundColor: "#fff",
              fontFamily: "Outfit",
              fontWeight: 600,
            }}
          >
            Create
          </Button>
        </Box>
      </Box>
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Search by code"
          value={search}
          onChange={handleSearchChange}
          sx={{
            backgroundColor: "#fff",
            fontFamily: "Outfit",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "15px",
            lineHeight: "22px",
            borderBottom: "1px solid #e0e0e0",
            borderRadius: 2,
            "& .MuiInputBase-input": {
              fontFamily: "Outfit",
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "22px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9e9e9e" }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              fontFamily: "Outfit",
              fontWeight: 400,
            },
          }}
        />
      </Box>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          maxWidth: "100%",
          overflow: "auto",
          border: "none",
          transition: "none",
          bgcolor: "#fafafb",
          boxShadow: viewMode === "card" ? "none" : undefined,
        }}
      >
        {loading ? (
          <Box textAlign="center" mt={6}>
            <CircularProgress />
          </Box>
        ) : coupons.length === 0 ? (
          <Typography mt={4} textAlign="center">
            No coupons found.
          </Typography>
        ) : viewMode === "card" ? (
          <Grid container spacing={3}>
            {coupons
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((coupon) => (
                <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "none",
                      border: "none",
                      transition: "none",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "none",
                          transition: "none",
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {coupon.code}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() =>
                                router.push(
                                  `/coupons/view?drawer=edit&id=${coupon.id}`
                                )
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => setDeleteId(coupon.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Discount: {coupon.discount_percentage ?? "-"}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Discount Price: {coupon.discount_price ?? "-"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Business Unit: {coupon.business_unit?.name ?? "-"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Usage Limit: {coupon.usage_limit ?? "-"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Used: {coupon.number_of_times_used ?? "0"} times
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Benefits: {htmlToPlainText(coupon.benefits || "-")}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        ) : (
          <Box component={Paper}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Discount (%)</TableCell>
                    <TableCell>Discount Price</TableCell>
                    <TableCell>Business Unit</TableCell>
                    <TableCell>Usage Limit</TableCell>
                    <TableCell>Number of times used</TableCell>
                    <TableCell>Benefits</TableCell>
                    <TableCell >Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {coupons
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>{coupon.coupon_title}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <Tooltip title={coupon.code}>
                            <span>{coupon.code}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{coupon.discount_percentage}</TableCell>
                        <TableCell>{coupon.discount_price}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <Tooltip title={coupon.business_unit?.name || "-"}>
                            <span>{coupon.business_unit?.name || "-"}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{coupon.usage_limit}</TableCell>
                        <TableCell>{coupon.number_of_times_used}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Tooltip
                            placement="top-start"
                            title={
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    marked.parse(
                                      coupon.benefits || "-"
                                    ) as string
                                  ),
                                }}
                              />
                            }
                          >
                            <span>
                              {htmlToPlainText(coupon.benefits || "-")}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ display: "flex" }}>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() =>
                                router.push(
                                  `/coupons/view?drawer=edit&id=${coupon.id}`
                                )
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton onClick={() => setDeleteId(coupon.id)}>
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              component={Paper}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",

                paddingY: 2,
                paddingX: 2,
              }}
            >
              {/* Previous Button */}
              <Button
                variant="outlined"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 0}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  minWidth: 100,
                }}
              >
                ← Previous
              </Button>

              {/* Pagination */}
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handleChangePage}
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
                hidePrevButton
                hideNextButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: "8px",
                    fontWeight: 500,
                    minWidth: "36px",
                    height: "36px",
                  },
                }}
              />

              {/* Next Button */}
              <Button
                variant="outlined"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page === totalPages - 1}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  minWidth: 100,
                }}
              >
                Next →
              </Button>
            </Box>
          </Box>
        )}
        {/* Delete Dialog */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>
            Are you sure you want to delete this coupon?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Drawer for Create */}
        <BaseDrawer
          open={drawerOpen === "create"}
          onClose={handleCloseDrawer}
          title="Create Coupon"
          width={drawerWidth} 
          
        >
          <CouponCreate
            onSuccess={() => {
              handleCloseDrawer();
              fetchCoupons();
            }}
            handleDrawerWidth={handleDrawerWidth}
          />
        </BaseDrawer>

        {/* Drawer for Edit */}
        {drawerOpen === "edit" && drawerId && (
          <BaseDrawer
            open
            onClose={handleCloseDrawer}
            title="Edit Coupon"
              width={drawerWidth} 
           
          >
            <CouponEdit
              onSuccess={() => {
                handleCloseDrawer();
                fetchCoupons();
              }}
              handleDrawerWidth={handleDrawerWidth}
            />
          </BaseDrawer>
        )}
      </Paper>
    </Box>
  );
};

export default CouponList;
