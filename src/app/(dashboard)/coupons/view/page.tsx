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
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { BusinessUnit } from "../types";

type Coupon = {
  discount_type: string;
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
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [selectedBU, setSelectedBU] = useState<number>(0);

  const [totalNumberOfPages, setTotalNumberOfPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const count = coupons.length;
  const totalPages = Math.ceil(count / rowsPerPage);
  const router = useRouter();
  const searchParams = useSearchParams();
  const drawerOpen = searchParams.get("drawer");
  const drawerId = searchParams.get("id");
  const handleCloseDrawer = () => {
    router.push("/coupons/view");
  };

  const [selectedCoupon, setSelectedCoupon] = useState<null | Coupon>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const fetchCoupons = async (
    name = "",
    selectedBU: number = 0,
    pageNumber: number,
    pageSize: number
  ) => {
    setLoading(true);
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    // Build query params cleanly
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (selectedBU && selectedBU !== 0)
      params.append("bu", selectedBU.toString());
    params.append("page", pageNumber.toString());
    params.append("pageSize", pageSize.toString());

    const res = await GET(`/coupons/${clientInfo.id}?${params.toString()}`);

    setCoupons(res?.data.data || []);
    setPageNumber(res?.data?.page);
    setTotalNumberOfPages(res?.data?.totalPages);
    setLoading(false);
  };

  const fetchBusinessUnits = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const response = await GET(`/business-units/${clientInfo.id}`);
    if (response?.data) {
      setBusinessUnits(response.data);
    } else {
      console.warn("No business units found");
      setBusinessUnits([]);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedCoupon(null);
  };
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    coupon: Coupon
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCoupon(coupon);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await DELETE(`/coupons/${deleteId}`);
    if (res?.status === 200) {
      toast.success("Coupon deleted!");
      fetchCoupons(search, selectedBU, pageNumber, pageSize);
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
      fetchCoupons(value, selectedBU, pageNumber, pageSize);
    }, 300);
  };

  useEffect(() => {
    fetchCoupons(search, selectedBU, pageNumber, pageSize);
  }, [selectedBU]);

  useEffect(() => {
    fetchCoupons(search, selectedBU, pageNumber, pageSize);
    fetchBusinessUnits();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }
  const paginationcoupon = coupons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDrawerWidth = (selectedCouponType: string) => {
    setDrawerWidth(
      // selectedCouponType === COUPON_TYPE.VEHICLE_SPECIFIC ? 900 : 700
      1100
    );
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", mt: "-25px" }}>
      {/* Title and create button */}
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

      {/* Filters */}
      <Box mb={2} gap={2} display="flex">
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
        <Select
          size="small"
          value={selectedBU}
          onChange={(e) => setSelectedBU(Number(e.target.value))}
          displayEmpty
          sx={{
            backgroundColor: "#fff",
            fontFamily: "Outfit",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "15px",
            lineHeight: "22px",
            borderBottom: "1px solid #e0e0e0",
            borderRadius: 2,
            minWidth: 250,
            "& .MuiInputBase-input": {
              fontFamily: "Outfit",
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "22px",
            },
          }}
        >
          <MenuItem value={0}>Select Business Unit</MenuItem>
          {businessUnits.map((bu) => (
            <MenuItem key={bu.id} value={bu.id}>
              {bu.name}
            </MenuItem>
          ))}
        </Select>
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
            {paginationcoupon.map((coupon) => (
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
                        <Typography
                          variant="h3"
                          fontWeight={500}
                          sx={{
                            fontFamily: "Outfit",
                            fontSize: "14px",
                            lineHeight: "21px",
                            letterSpacing: "0%",
                          }}
                        >
                          {coupon?.coupon_title}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          onClick={(event) => handleMenuClick(event, coupon)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          slotProps={{
                            paper: {
                              sx: {
                                boxShadow: "none",
                                border: "1px solid #e0e0e0",
                                mt: 1,
                              },
                            },
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              handleClose();
                              if (selectedCoupon) {
                                router.push(
                                  `/coupons/view?drawer=edit&id=${selectedCoupon.id}`
                                );
                              }
                            }}
                          >
                            <EditIcon
                              fontSize="small"
                              style={{ marginRight: 8 }}
                            />
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              handleClose();
                              if (selectedCoupon) {
                                setDeleteId(selectedCoupon.id);
                              }
                            }}
                          >
                            <DeleteIcon
                              fontSize="small"
                              style={{ marginRight: 8 }}
                            />
                            Delete
                          </MenuItem>
                        </Menu>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Code: {coupon.code}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Discount Type:{" "}
                      {coupon?.discount_type === "fixed_discount"
                        ? "Fixed"
                        : "Percentage"}
                    </Typography>

                    {coupon?.discount_price && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Discount Price: {coupon.discount_price ?? "-"}
                      </Typography>
                    )}

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
                      Benefits: {htmlToPlainText(coupon.benefits || "-").trim()}
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
                    <TableCell>Discount Type</TableCell>
                    <TableCell>Discount Price</TableCell>
                    <TableCell>Business Unit</TableCell>
                    <TableCell>Usage Limit</TableCell>
                    <TableCell>Number of times used</TableCell>
                    <TableCell>Benefits</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {coupons.map((coupon) => (
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
                      <TableCell>
                        {coupon.discount_type === "fixed_discount"
                          ? "Fixed"
                          : "Percentage"}
                      </TableCell>
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
                                  marked.parse(coupon.benefits || "-") as string
                                ),
                              }}
                            />
                          }
                        >
                          <span>{htmlToPlainText(coupon.benefits || "-")}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ display: "flex" }}>
                        <IconButton
                          onClick={(event) => handleMenuClick(event, coupon)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          slotProps={{
                            paper: {
                              sx: {
                                boxShadow: "none",
                                border: "1px solid #e0e0e0",
                                mt: 1,
                              },
                            },
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              handleClose();
                              if (selectedCoupon) {
                                router.push(
                                  `/coupons/view?drawer=edit&id=${selectedCoupon.id}`
                                );
                              }
                            }}
                          >
                            <EditIcon
                              fontSize="small"
                              style={{ marginRight: 8 }}
                            />
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              handleClose();
                              if (selectedCoupon) {
                                setDeleteId(selectedCoupon.id);
                              }
                            }}
                          >
                            <DeleteIcon
                              fontSize="small"
                              style={{ marginRight: 8 }}
                            />
                            Delete
                          </MenuItem>
                        </Menu>
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
                onClick={() =>
                  fetchCoupons(
                    search,
                    selectedBU,
                    Number(pageNumber) - 1,
                    pageSize
                  )
                }
                disabled={Number(pageNumber) === 1}
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
                count={Number(totalNumberOfPages)}
                page={Number(pageNumber)}
                onChange={(_, value) => {
                  setPageNumber(value);
                  fetchCoupons(search, selectedBU, value, pageSize);
                }}
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
                onClick={() =>
                  fetchCoupons(
                    search,
                    selectedBU,
                    Number(pageNumber) + 1,
                    pageSize
                  )
                }
                disabled={Number(pageNumber) === Number(totalNumberOfPages)}
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
        <ConfirmDeleteDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          setDeleteId={setDeleteId}
          handleDelete={handleDelete}
          message="Are you sure you want to delete this coupon?"
        />

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
              fetchCoupons(search, selectedBU, pageNumber, pageSize);
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
                fetchCoupons(search, selectedBU, pageNumber, pageSize);
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
