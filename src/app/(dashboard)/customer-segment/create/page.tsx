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
  Autocomplete,
  InputAdornment,
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
  const [nameAr, setNameAr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const clientInfo = localStorage.getItem("client-info");
  const parsed = JSON.parse(clientInfo!);
  const tenantId = parsed?.id || 1;
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchText, setSearchText] = useState("");

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
      setCustomers(allCustomers.data);
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
        name_ar: nameAr,
        description_ar: descriptionAr,
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

  const handleArabictranslate = async (key: string, value: string) => {
    if (value) {
      try {
        setTranslationLoading((prev) => ({ ...prev, [key]: true }));
        const res = await POST("/openai/translate-to-arabic", { value });
        if (res?.data.status) {
          if (key === "segment_name_arabic") {
            setNameAr(res?.data?.data);
          } else if (key === "description_arabic") {
            setDescriptionAr(res?.data?.data);
          }
        }
      } catch (error: any) {
        return {
          success: false,
          status: error?.response?.status || 500,
          message: error?.response?.data?.message || "Unknown error",
        };
      } finally {
        setTranslationLoading((prev) => ({ ...prev, [key]: false }));
      }
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
            onBlur={(e) =>
              handleArabictranslate("segment_name_arabic", e.target.value)
            }
            required
            disabled={loading || submitted}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {translationLoading["segment_name_arabic"] && (
                    <CircularProgress size={20} />
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <InfoLabel
            label="Segment Name Arabic"
            tooltip="Give your customer segment a meaningful name."
          />
          <TextField
            fullWidth
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
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
            onBlur={(e) =>
              handleArabictranslate("description_arabic", e.target.value)
            }
            disabled={loading || submitted}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {translationLoading["description_arabic"] && (
                    <CircularProgress size={20} />
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <InfoLabel
            label="Description Arabic"
            tooltip="Optional: Describe what defines this segment."
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            disabled={loading || submitted}
          />
        </Grid>

        {customers.length > 0 ? (
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={customers}
              value={customers.filter((c) =>
                selectedCustomerIds.includes(c.id)
              )}
              onChange={(_, newValue) =>
                setSelectedCustomerIds(newValue.map((c) => c.id))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Add Customers" fullWidth />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props; // ✅ take key out
                return (
                  <li key={key} {...rest}>
                    {option.name} (
                    <span
                      style={{
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {option.email.trim()}
                    </span>
                    )
                  </li>
                );
              }}
            />
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
