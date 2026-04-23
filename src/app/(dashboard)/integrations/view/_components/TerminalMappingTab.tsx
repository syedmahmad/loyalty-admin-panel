"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { terminalService } from "@/services/terminalService";
import type { TerminalMapping } from "@/types/integration.types";

interface Props {
  integrationId: number; // tenant_partner_integration_id
}

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];

const emptyForm = { branchId: "", terminalId: "", label: "" };

const TerminalMappingTab = ({ integrationId }: Props) => {
  const queryClient = useQueryClient();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<TerminalMapping | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<TerminalMapping | null>(null);

  // CSV import state
  const [importing, setImporting] = useState(false);

  const queryKey = ["terminals", integrationId];

  const { data: terminals = [], isLoading } = useQuery<TerminalMapping[]>({
    queryKey,
    queryFn: () => terminalService.getByIntegration(integrationId),
    enabled: !!integrationId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) =>
      terminalService.create({
        tenantPartnerIntegrationId: integrationId,
        branchId: payload.branchId,
        terminalId: payload.terminalId,
        label: payload.label || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Terminal added successfully");
      setShowAddForm(false);
      setAddForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add terminal");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: typeof emptyForm }) =>
      terminalService.update(id, {
        branchId: form.branchId,
        terminalId: form.terminalId,
        label: form.label,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Terminal updated");
      setEditTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update terminal");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => terminalService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Terminal removed");
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove terminal");
    },
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const validateForm = (form: typeof emptyForm) => {
    const errors: Record<string, string> = {};
    if (!form.branchId.trim()) errors.branchId = "Branch ID is required";
    if (!form.terminalId.trim()) errors.terminalId = "Terminal ID is required";
    return errors;
  };

  const filteredTerminals = terminals.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.branchId.toLowerCase().includes(q) ||
      t.terminalId.toLowerCase().includes(q) ||
      (t.label ?? "").toLowerCase().includes(q)
    );
  });

  const paginated = filteredTerminals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ─── CSV import ────────────────────────────────────────────────────────────

  const handleCsvUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (csvInputRef.current) csvInputRef.current.value = "";

      setImporting(true);
      try {
        const text = await file.text();
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

        // Skip header row if it starts with non-numeric (e.g. "branch_id,terminal_id,label")
        const dataLines = lines[0]?.toLowerCase().startsWith("branch") ? lines.slice(1) : lines;

        const parsed = dataLines.map((line) => {
          const [branchId, terminalId, ...rest] = line.split(",").map((c) => c.trim());
          return { branchId, terminalId, label: rest.join(",") || undefined };
        }).filter((r) => r.branchId && r.terminalId);

        if (parsed.length === 0) {
          toast.warning("No valid rows found in CSV (expected: branch_id,terminal_id,label)");
          return;
        }

        const result = await terminalService.bulkCreate(integrationId, parsed);
        queryClient.invalidateQueries({ queryKey });
        toast.success(`Imported: ${result.created} added, ${result.skipped} skipped (duplicates)`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "CSV import failed");
      } finally {
        setImporting(false);
      }
    },
    [integrationId, queryClient, queryKey]
  );

  // ─── Add handlers ──────────────────────────────────────────────────────────

  const handleAddSubmit = () => {
    const errs = validateForm(addForm);
    if (Object.keys(errs).length) { setAddErrors(errs); return; }
    setAddErrors({});
    createMutation.mutate(addForm);
  };

  // ─── Edit handlers ─────────────────────────────────────────────────────────

  const openEdit = (t: TerminalMapping) => {
    setEditTarget(t);
    setEditForm({ branchId: t.branchId, terminalId: t.terminalId, label: t.label ?? "" });
    setEditErrors({});
  };

  const handleEditSubmit = () => {
    if (!editTarget) return;
    const errs = validateForm(editForm);
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setEditErrors({});
    updateMutation.mutate({ id: editTarget.id, form: editForm });
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search branch/terminal/label…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 240 }}
        />

        <Box flex={1} />

        <Tooltip title="CSV format: branch_id,terminal_id,label (header row optional)">
          <Button
            variant="outlined"
            size="small"
            startIcon={importing ? <CircularProgress size={14} /> : <UploadFileIcon />}
            onClick={() => csvInputRef.current?.click()}
            disabled={importing}
          >
            Import CSV
          </Button>
        </Tooltip>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={handleCsvUpload}
        />

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => { setShowAddForm((v) => !v); setAddForm(emptyForm); setAddErrors({}); }}
        >
          Add Terminal
        </Button>
      </Box>

      {/* Inline add form */}
      {showAddForm && (
        <Box
          display="flex"
          gap={1}
          mb={2}
          p={1.5}
          border="1px solid"
          borderColor="divider"
          borderRadius={1}
          flexWrap="wrap"
          alignItems="flex-start"
        >
          <TextField
            size="small"
            label="Branch ID *"
            value={addForm.branchId}
            onChange={(e) => setAddForm((f) => ({ ...f, branchId: e.target.value }))}
            error={!!addErrors.branchId}
            helperText={addErrors.branchId}
            sx={{ minWidth: 160 }}
          />
          <TextField
            size="small"
            label="Terminal ID *"
            value={addForm.terminalId}
            onChange={(e) => setAddForm((f) => ({ ...f, terminalId: e.target.value }))}
            error={!!addErrors.terminalId}
            helperText={addErrors.terminalId}
            sx={{ minWidth: 160 }}
          />
          <TextField
            size="small"
            label="Label (optional)"
            value={addForm.label}
            onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
            sx={{ minWidth: 200 }}
          />
          <Box display="flex" gap={0.5} mt={0.5}>
            <IconButton
              color="primary"
              size="small"
              onClick={handleAddSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <CircularProgress size={16} /> : <CheckIcon />}
            </IconButton>
            <IconButton size="small" onClick={() => setShowAddForm(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Table */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredTerminals.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          {search ? "No terminals match your search." : "No terminals yet. Add one manually or import a CSV."}
        </Typography>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Branch ID</TableCell>
                <TableCell>Terminal ID</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((t, idx) => (
                <TableRow key={t.id} hover>
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{t.branchId}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{t.terminalId}</TableCell>
                  <TableCell>{t.label || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={t.isActive ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(t)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(t)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredTerminals.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          />
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Terminal</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              size="small"
              label="Branch ID *"
              value={editForm.branchId}
              onChange={(e) => setEditForm((f) => ({ ...f, branchId: e.target.value }))}
              error={!!editErrors.branchId}
              helperText={editErrors.branchId}
              fullWidth
            />
            <TextField
              size="small"
              label="Terminal ID *"
              value={editForm.terminalId}
              onChange={(e) => setEditForm((f) => ({ ...f, terminalId: e.target.value }))}
              error={!!editErrors.terminalId}
              helperText={editErrors.terminalId}
              fullWidth
            />
            <TextField
              size="small"
              label="Label (optional)"
              value={editForm.label}
              onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={updateMutation.isPending}
            startIcon={updateMutation.isPending ? <CircularProgress size={14} /> : undefined}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Remove Terminal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove terminal{" "}
            <strong>{deleteTarget?.branchId} / {deleteTarget?.terminalId}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={14} /> : undefined}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TerminalMappingTab;
