"use client";

import {
  Box,
  Button,
  Grid,
  InputLabel,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

const fetchAllCustomers = async (tenantId: number) => {
  const response = await GET(`/customers/${tenantId}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch customers");
  }
  return response.data;
};

const CreateCustomerSegment = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const clientInfo = localStorage.getItem("client-info");
  const parsed = JSON.parse(clientInfo!);
  const tenantId = parsed?.id || 1;
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const InfoLabel = ({
    label,
    tooltip,
  }: {
    label: string;
    tooltip: string;
  }) => (
    <Box display="flex" alignItems="center" mb={0.5}>
      <InputLabel sx={{ mr: 0.5 }}>{label}</InputLabel>
      {/* Tooltip could be added here if needed */}
    </Box>
  );

  useEffect(() => {
    const fetchData = async () => {
      const allCustomers = await fetchAllCustomers(tenantId);
      setCustomers(allCustomers);
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const clientInfo = localStorage.getItem("client-info");
      if (!clientInfo)
        throw new Error("Client info not found in localStorage.");

      const parsed = JSON.parse(clientInfo);
      const payload = {
        name,
        description,
        tenant_id: parsed.id,
        selected_customer_ids: selectedCustomerIds,
      };

      console.log("Creating customer segment with payload:", payload);

      const res = await POST("/customer-segments", payload);

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Customer segment created successfully!");
        setSubmitted(true);
        onSuccess?.();
        router.push("/customer-segment/view");
      } else {
        setError("Failed to create customer segment");
      }
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Unexpected error occurred"
      );
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <InfoLabel
            label="Segment Name"
            tooltip="Give your customer segment a meaningful name."
          />
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading || submitted}
          />
        </Grid>

        <Grid item xs={12}>
          <InfoLabel
            label="Description"
            tooltip="Optional: Describe what defines this segment."
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || submitted}
          />
        </Grid>

        {customers.length > 0 ? (
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Add Customers"
              SelectProps={{
                multiple: true,
                value: selectedCustomerIds,
                onChange: (e: any) => setSelectedCustomerIds(e.target.value),
                renderValue: (selected: any) =>
                  customers
                    .filter((c) => selected.includes(c.id))
                    .map((c) => c.name)
                    .join(", "),
              }}
            >
              {customers.length > 0 &&
                customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} (
                    <span
                      style={{
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.email.trim()}
                    </span>
                    )
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography variant="h5" textAlign="center" sx={{ mt: 2 }}>
              No customers available to add.
            </Typography>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}
      </Grid>

      <Grid item xs={12}>
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || submitted}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 550 }}
          >
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </Box>
      </Grid>
    </>
  );
};

export default CreateCustomerSegment;
