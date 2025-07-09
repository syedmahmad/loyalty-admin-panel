"use client";

import BaseDrawer from "@/components/drawer/basedrawer";
import { DELETE, GET } from "@/utils/AxiosUtility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Paper,
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
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CouponCreate from "../create/page";
import CouponEdit from "../edit/page";
import { htmlToPlainText } from "@/utils/Index";
import { COUPON_TYPE } from "@/constants/constants";

type Coupon = {
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [drawerWidth, setDrawerWidth] = useState(700);

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

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
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
      selectedCouponType === COUPON_TYPE.VEHICLE_SPECIFIC ? 900 : 700
    );
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
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
        <Button
          variant="outlined"
          onClick={() => router.push("/coupons/view?drawer=create")}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          Create
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="Search by code"
          value={search}
          onChange={handleSearchChange}
        />
      </Box>
      <Paper
        elevation={3}
        sx={{ p: 3, borderRadius: 3, maxWidth: "100%", overflow: "auto" }}
      >
        {loading ? (
          <Box textAlign="center" mt={6}>
            <CircularProgress />
          </Box>
        ) : coupons.length === 0 ? (
          <Typography mt={4} textAlign="center">
            No coupons found.
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Discount (%)</TableCell>
                    <TableCell>Discount Price</TableCell>
                    <TableCell>Business Unit</TableCell>
                    <TableCell>Usage Limit</TableCell>
                    <TableCell>Number of times used</TableCell>
                    <TableCell>Benefits</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {coupons
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((coupon) => (
                      <TableRow key={coupon.id}>
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

            <TablePagination
              component="div"
              count={coupons.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
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
    </>
  );
};

export default CouponList;
