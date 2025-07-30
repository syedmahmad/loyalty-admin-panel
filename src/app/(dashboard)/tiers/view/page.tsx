"use client";

import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  InputAdornment,
  TextField,
  Paper,
  Pagination,
  Select,
  MenuItem,
  Grid,
  CardContent,
  Menu,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { DELETE, GET } from "@/utils/AxiosUtility";
import DOMPurify from "dompurify";
import { marked } from "marked";
import BaseDrawer from "@/components/drawer/basedrawer";
import TierCreate from "../create/page";
import TierEdit from "../edit/page";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
type Tier = {
  id: number;
  name: string;
  min_points: number;
  points_conversion_rate: number;
  benefits?: string;
  business_unit?: { name: string };
};

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const TierList = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const count = tiers.length;
  const totalPages = Math.ceil(count / rowsPerPage);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const router = useRouter();
  const searchParams = useSearchParams();
  const drawerOpen = searchParams.get("drawer");
  const drawerId = searchParams.get("id");
  const [selectedTier, setSelectedTier] = useState<null | Tier>(null);

  const handleCloseDrawer = () => {
    router.push("/tiers/view");
  };
  const fetchTiers = async (name = "") => {
    setLoading(true);
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(
      `/tiers/${clientInfo.id}?name=${encodeURIComponent(name)}`
    );
    setTiers(res?.data?.tiers || []);
    setLoading(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setTimeout(() => {
      fetchTiers(value);
    }, 300);
  };
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    tier: Tier
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTier(tier);
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await DELETE(`/tiers/${deleteId}`);
    if (res?.status === 200) {
      toast.success("Tier deleted!");
      fetchTiers(search);
    } else {
      toast.error("Failed to delete tier");
    }

    setDeleteId(null);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedTier(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage - 1);
  };
  const paginatedtier =
    viewMode === "card"
      ? tiers
      : tiers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", mt: "-25px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
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
          Tier List
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
            onClick={() => router.push("/tiers/view?drawer=create")}
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
          placeholder="Search by name"
          value={search}
          onChange={handleSearchChange}
          sx={{
            backgroundColor: "#fff",
            fontFamily: "Outfit",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "15px",

            borderBottom: "1px solid #e0e0e0",
            borderRadius: 2,
            "& .MuiInputBase-input": {
              fontFamily: "Outfit",
              fontWeight: 400,
              fontSize: "15px",
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
          <Box textAlign="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : viewMode === "card" ? (
          <Grid container spacing={3}>
            {paginatedtier.map((tier) => (
              <Grid item xs={12} sm={6} md={4} key={tier.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "none",
                    border: "1px solid #e0e0e0",
                    transition: "none",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
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
                        {tier.name}
                      </Typography>
                      <Box>
                        <IconButton
                          onClick={(event) => handleMenuClick(event, tier)}
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
                              if (selectedTier) {
                                router.push(
                                  `/tiers/view?drawer=edit&id=${selectedTier.id}`
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
                              if (selectedTier) {
                                setDeleteId(selectedTier.id);
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
                      Min Points: {tier.min_points}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Business Unit: {tier.business_unit?.name || "-"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Benefits: {htmlToPlainText(tier.benefits || "-")}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {tiers.length === 0 && (
              <Grid item xs={12}>
                <Typography align="center">No tiers found.</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Min Points</TableCell>
                    <TableCell>Business Unit</TableCell>
                    <TableCell>Benefits</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tiers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tier) => (
                      <TableRow key={tier.id}>
                        <TableCell>
                          <Tooltip title={tier.name}>
                            <span>{tier.name}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{tier.min_points}</TableCell>
                        <TableCell>
                          <Tooltip title={tier.business_unit?.name || "-"}>
                            <span>{tier.business_unit?.name || "-"}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    marked.parse(tier.benefits || "-") as string
                                  ),
                                }}
                              />
                            }
                          >
                            <span>{htmlToPlainText(tier.benefits || "-")}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(event) => handleMenuClick(event, tier)}
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
                                if (selectedTier) {
                                  router.push(
                                    `/tiers/view?drawer=edit&id=${selectedTier.id}`
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
                                if (selectedTier) {
                                  setDeleteId(selectedTier.id);
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
                  {tiers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No tiers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              component={Paper}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #E0E0E0", // top border line
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
          </>
        )}

        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Are you sure you want to delete this tier?</DialogTitle>
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
          title="Create Tier"
          width={500}
        >
          <TierCreate
            onSuccess={() => {
              handleCloseDrawer();
              fetchTiers();
            }}
          />
        </BaseDrawer>

        {/* Drawer for Edit */}
        {drawerOpen === "edit" && drawerId && (
          <BaseDrawer
            open
            onClose={handleCloseDrawer}
            title="Edit Tier"
            width={500}
          >
            <TierEdit
              onSuccess={() => {
                handleCloseDrawer();
                fetchTiers();
              }}
            />
          </BaseDrawer>
        )}
      </Paper>
    </Box>
  );
};

export default TierList;
