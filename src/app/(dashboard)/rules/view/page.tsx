"use client";

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
  Menu,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { GET, DELETE } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import RuleCreateForm from "../create/page";
import RuleEdit from "../edit/page";
import BaseDrawer from "@/components/drawer/basedrawer";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { BusinessUnit } from "../../coupons/types";
import { htmlToPlainText } from "@/utils/Index";

type Rule = {
  burn_type: string;
  uuid: string;
  id: number;
  name: string;
  rule_type: "event based earn" | "spend and earn" | "burn" | "dynamic rule";
  min_amount_spent?: number;
  reward_points?: number;
  event_triggerer?: string;
  max_redeemption_points_limit?: number;
  points_conversion_factor?: number;
  max_burn_percent_on_invoice?: number;
  condition_type?: string;
  condition_operator?: string;
  condition_value?: string;
  description?: string;
};

const RuleList = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const count = rules.length;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRule, setSelectedRule] = useState<null | Rule>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [selectedBU, setSelectedBU] = useState<number>(0);

  const open = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, rule: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRule(rule);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRule(null);
  };

  const [rowsPerPage, setRowsPerPage] = useState(7);
  const totalPages = Math.ceil(count / rowsPerPage);
  const searchParams = useSearchParams();
  const drawerOpen = searchParams.get("drawer");
  const drawerId = searchParams.get("uuid");
  const router = useRouter();
  const fetchRules = async (name = "", selectedBU: number = 0) => {
    setLoading(true);
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    let query = name ? `?name=${encodeURIComponent(name)}` : "";
    if (selectedBU !== 0 && selectedBU !== undefined) {
      query += query ? `&bu=${selectedBU}` : `?bu=${selectedBU}`;
    }

    const res = await GET(`/rules/${clientInfo.id}${query}`);
    setRules(res?.data?.rules || []);
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

  const handleCloseDrawer = () => {
    const currentUrl = window.location.pathname;
    router.push(currentUrl);
  };
  //  const fetchRules = async () => {
  //   setLoading(true);
  //   const res = await GET('/rules');
  //   setRules(res?.data || []);
  //   setLoading(false);
  // };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await DELETE(`/rules/${deleteId}`);
    if (res?.status === 200) {
      toast.success("Rule deleted!");
      fetchRules(nameFilter, selectedBU);
    } else {
      toast.error("Failed to delete rule");
    }
    setDeleteId(null);
  };

  useEffect(() => {
    fetchRules();
    fetchBusinessUnits();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setNameFilter(searchName);
      fetchRules(searchName, selectedBU);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchName, selectedBU]);

  const handleChangePage = (_: unknown, newPage: number) =>
    setPage(newPage - 1);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedrule: any =
    viewMode === "card"
      ? rules
      : rules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          Rules
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
            onClick={() => router.push("/rules/view?drawer=create")}
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
          <Box mt={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : rules.length === 0 ? (
          <Typography mt={3} textAlign="center">
            No rules found.
          </Typography>
        ) : viewMode === "card" ? (
          <Grid container spacing={3}>
            {paginatedrule?.map((rule: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
                      {" "}
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
                        {rule?.locales[0]?.name}
                      </Typography>
                      <Box>
                        <IconButton
                          onClick={(event) => handleMenuClick(event, rule)}
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
                              if (selectedRule) {
                                router.push(
                                  `/rules/view?drawer=edit&uuid=${selectedRule.uuid}`
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
                              if (selectedRule) {
                                setDeleteId(selectedRule.uuid);
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
                      Type: {rule.rule_type}
                    </Typography>

                    {rule.rule_type === "event based earn" && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Event: {rule.event_triggerer || "-"}
                      </Typography>
                    )}

                    {rule.rule_type === "dynamic rule" && (
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1}
                        >
                          Condition: {rule.condition_type || "-"}{" "}
                          {rule.condition_operator || "-"}{" "}
                          {rule.condition_value || "-"}
                        </Typography>
                      </>
                    )}

                    {rule.rule_type === "burn" && (
                      <>
                        {rule?.max_redeemption_points_limit && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={1}
                          >
                            Max Redeem:{" "}
                            {rule.max_redeemption_points_limit ?? "-"}
                          </Typography>
                        )}

                        {rule?.burn_type === "FIXED" ? (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Conversion: {rule.points_conversion_factor ?? "-"}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Max Burn %:{" "}
                              {rule.max_burn_percent_on_invoice ?? "-"}
                            </Typography>
                          </>
                        )}
                      </>
                    )}

                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Description: {htmlToPlainText(rule?.description || "")}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Min Spend</TableCell>
                    <TableCell>Reward Points</TableCell>
                    <TableCell>Event Trigger</TableCell>
                    <TableCell>Condition Type</TableCell>
                    <TableCell>Condition Operator</TableCell>
                    <TableCell>Condition Value</TableCell>
                    <TableCell>Max Redeem Points</TableCell>
                    <TableCell>Conversion Factor</TableCell>
                    <TableCell>Max Burn %</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((rule: any, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {rule?.locales[0]?.name}={rule.id}
                        </TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>
                          {rule.rule_type}
                        </TableCell>
                        <TableCell>{rule.min_amount_spent ?? "-"}</TableCell>
                        <TableCell>{rule.reward_points ?? "-"}</TableCell>
                        <TableCell>
                          {rule.rule_type === "event based earn"
                            ? rule.event_triggerer || "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {rule.rule_type === "dynamic rule"
                            ? rule.condition_type || "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {rule.rule_type === "dynamic rule"
                            ? rule.condition_operator || "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {rule.rule_type === "dynamic rule"
                            ? rule.condition_value || "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {rule.rule_type === "burn"
                            ? rule.max_redeemption_points_limit ?? "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {rule.rule_type === "burn"
                            ? rule.points_conversion_factor ?? "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {rule.rule_type === "burn"
                            ? rule.max_burn_percent_on_invoice ?? "-"
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(event) => handleMenuClick(event, rule)}
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
                                if (selectedRule) {
                                  router.push(
                                    `/rules/view?drawer=edit&uuid=${selectedRule.uuid}`
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
                                if (selectedRule) {
                                  setDeleteId(selectedRule.uuid);
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
                  {rules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No Rule found.
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

        <ConfirmDeleteDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          setDeleteId={setDeleteId}
          handleDelete={handleDelete}
          message="Are you sure you want to delete this rule?"
        />

        {/* Drawer for Create */}
        <BaseDrawer
          open={drawerOpen === "create"}
          onClose={handleCloseDrawer}
          title="Create Rule"
          width={750}
        >
          <RuleCreateForm
            onSuccess={() => {
              handleCloseDrawer();
              fetchRules(searchName, selectedBU);
            }}
          />
        </BaseDrawer>

        {/* Drawer for Edit */}
        {drawerOpen === "edit" && drawerId && (
          <BaseDrawer
            open={true}
            onClose={handleCloseDrawer}
            title="Edit Rule"
            width={750}
          >
            <RuleEdit
              onSuccess={() => {
                handleCloseDrawer();
                fetchRules(searchName, selectedBU);
              }}
            />
          </BaseDrawer>
        )}
      </Paper>
    </Box>
  );
};

export default RuleList;
