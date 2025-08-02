"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  InputAdornment,
  Button,
  TablePagination,
  TextField,
  CardContent,
  Grid,
  Card,
  Select,
  MenuItem,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import { useRouter, useSearchParams } from "next/navigation";
import { DELETE, GET } from "@/utils/AxiosUtility";
import BaseDrawer from "@/components/drawer/basedrawer";
import BusinessUnitEditForm from "../edit/page";
import BusinessUnitCreateForm from "../create/page";
import Pagination from "@mui/material/Pagination";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";

type BusinessUnit = {
  id: number;
  name: string;
  description?: string;
  location?: string;
};

const fetchBusinessUnits = async (
  name: string = ""
): Promise<BusinessUnit[]> => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const response = await GET(
    `/business-units/${clientInfo.id}?name=${encodeURIComponent(name)}`
  );
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

const deleteBusinessUnit = async (id: number): Promise<void> => {
  const response = await DELETE(`/business-units/${id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to delete business unit");
  }
};

const BusinessUnitList = () => {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [searchName, setSearchName] = useState("");
  const searchParams = useSearchParams();
  const drawerOpen = searchParams.get("drawer");
  const drawerId = searchParams.get("id");
  const count = units.length;
  const totalPages = Math.ceil(count / rowsPerPage);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBusinessUnit, setSelectedBusinessUnit] =
    useState<null | BusinessUnit>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedBusinessUnit(null);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    businessUnit: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBusinessUnit(businessUnit);
  };
  const handleCloseDrawer = () => {
    const currentUrl = window.location.pathname;
    router.push(currentUrl);
  };

  const loadData = async (name = "") => {
    setLoading(true);
    try {
      const data = await fetchBusinessUnits(name);
      setUnits(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadData(searchName.trim());
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchName]);

  const handleDelete = async () => {
    if (confirmDeleteId !== null) {
      await deleteBusinessUnit(confirmDeleteId);
      setConfirmDeleteId(null);
      await loadData(searchName.trim());
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage - 1);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUnits =
    viewMode === "card"
      ? units
      : units.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          Business Units
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
            onClick={() => router.push("/business-units/view?drawer=create")}
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
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
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
          <Box mt={6} textAlign="center">
            <CircularProgress />
          </Box>
        ) : viewMode === "card" ? (
          <Grid container spacing={3} sx={{ boxShadow: "none" }}>
            {paginatedUnits.map((unit) => (
              <Grid item xs={12} sm={6} md={4} key={unit.id}>
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
                  <CardContent sx={{ boxShadow: "none" }}>
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
                          {unit.name}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          onClick={(event) => handleMenuClick(event, unit)}
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
                              if (selectedBusinessUnit) {
                                router.push(
                                  `/business-units/view?drawer=edit&id=${selectedBusinessUnit.id}`
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
                              if (selectedBusinessUnit) {
                                setConfirmDeleteId(selectedBusinessUnit.id);
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
                      {unit.description || "No Description"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {unit.location || "No Location"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {paginatedUnits.length === 0 && (
              <Grid item xs={12}>
                <Typography align="center">No business units found.</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <Box component={Paper}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <BusinessIcon
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Name
                    </TableCell>
                    <TableCell>
                      <DescriptionIcon
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Description
                    </TableCell>
                    <TableCell>
                      <LocationOnIcon
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Location
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>{unit.name}</TableCell>
                      <TableCell>{unit.description || "—"}</TableCell>
                      <TableCell>{unit.location || "—"}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(event) => handleMenuClick(event, unit)}
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
                              if (selectedBusinessUnit) {
                                router.push(
                                  `/business-units/view?drawer=edit&id=${selectedBusinessUnit.id}`
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
                              if (selectedBusinessUnit) {
                                setConfirmDeleteId(selectedBusinessUnit.id);
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
                  {units.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No business units found.
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

        <ConfirmDeleteDialog
          open={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          setDeleteId={setConfirmDeleteId}
          handleDelete={handleDelete}
          message="Are you sure you want to delete this business unit?"
        />

        <BaseDrawer
          open={drawerOpen === "create"}
          onClose={handleCloseDrawer}
          title="Create Business"
          width={500}
        >
          <BusinessUnitCreateForm
            onSuccess={() => {
              loadData();
              handleCloseDrawer();
            }}
          />
        </BaseDrawer>

        {/* Drawer for Edit */}
        {drawerOpen === "edit" && drawerId && (
          <BaseDrawer
            open={true}
            onClose={handleCloseDrawer}
            title="Edit Business"
            width={500}
          >
            <BusinessUnitEditForm
              onSuccess={() => {
                handleCloseDrawer();
                loadData();
              }}
            />
          </BaseDrawer>
        )}
      </Paper>
    </Box>
  );
};

export default BusinessUnitList;
