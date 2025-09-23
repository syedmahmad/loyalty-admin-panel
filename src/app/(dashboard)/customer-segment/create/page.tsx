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
import SearchAutoSuggest from "@/components/columnSearch/SearchAutoSuggest";
import { DRAWER_TYPE_BULK_UPLOAD } from "@/constants/constants";
import { BusinessUnit } from "../../coupons/types";

const fetchAllCustomers = async (tenantId: number) => {
  const response = await GET(`/customers/${tenantId}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch customers");
  }
  return response.data;
};

const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const response = await GET(`/business-units/${clientInfo.id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

const CreateCustomerSegment = ({ onSuccess, drawerType }: any) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [selectedBusinessUnitId, setSelectedBusinessUnitId] =
    useState<string>("");
  const router = useRouter();

  const clientInfo = localStorage.getItem("client-info");
  const parsed = JSON.parse(clientInfo!);
  const tenantId = parsed?.id || 1;
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchText, setSearchText] = useState("");
  const [selectedCouponCsv, setSelectedCouponCsv] = useState<File | null>(null);

  /** States For Auto suggest dropdown Start */
  const [options, setOptions] = useState<{ label: string; id: number }[]>([]);
  const [selectedValues, setSelectedValues] = useState<
    { label: string; id: number }[]
  >([]);
  const [autoSuggestLoading, setAutoSuggestLoading] = useState(false);
  let debounceTimer: NodeJS.Timeout;
  /** States For Auto suggest dropdown End */

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
      const payload: {
        name: string;
        description: string;
        name_ar: string;
        description_ar: string;
        tenant_id: any;
        selected_customer_ids: number[];
        business_unit_id: string;
        file?: any;
      } = {
        name,
        description,
        name_ar: nameAr,
        description_ar: descriptionAr,
        tenant_id: parsed.id,
        business_unit_id: selectedBusinessUnitId,
        selected_customer_ids: selectedCustomerIds,
      };

      console.log("Creating customer segment with payload:", payload);

      if (drawerType == DRAWER_TYPE_BULK_UPLOAD) {
        // ⬇️ Create FormData for file + other fields
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("name_ar", nameAr);
        formData.append("description_ar", descriptionAr);
        formData.append("tenant_id", parsed.id);
        formData.append("business_unit_id", String(selectedBusinessUnitId));

        if (selectedCouponCsv) {
          formData.append("file", selectedCouponCsv); // 👈 File upload
        }

        const res = await POST("/customer-segments/bulk-upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res?.status === 201 || res?.status === 200) {
          toast.success("Customer segment uploaded successfully!");
          setSubmitted(true);
          onSuccess?.();
          router.push("/customer-segment/view");
        } else {
          setError("Failed to upload customer segment");
        }
      } else {
        const res = await POST("/customer-segments", payload);
        if (res?.status === 201 || res?.status === 200) {
          toast.success("Customer segment created successfully!");
          setSubmitted(true);
          onSuccess?.();
          router.push("/customer-segment/view");
        } else {
          setError("Failed to create customer segment");
        }
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

  /**Auto Suggest Dropdown */
  const handleAddCustomerInputChange = (inputString: string) => {
    if (inputString.trim() === "") {
      setOptions([]);
      return undefined;
    }

    // clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // ⏳ Debounce delay
    debounceTimer = setTimeout(async () => {
      setAutoSuggestLoading(true);
      try {
        const allCustomers = await fetchAllCustomers(tenantId);
        setOptions(
          allCustomers.data.map((item: any) => ({
            id: item.id,
            label: item.name,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setAutoSuggestLoading(false);
      }
    }, 400);
  };

  useEffect(() => {
    const selectedIds = selectedValues.map((item) => item.id);
    setSelectedCustomerIds(selectedIds);
  }, [selectedValues]);

  const fetchBusinessUnitInfo = async () => {
    setLoading(true);
    try {
      const [buData] = await Promise.all([fetchBusinessUnits()]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  // Get all businessunits
  useEffect(() => {
    fetchBusinessUnitInfo();
  }, []);

  // Bulk Upload Customer from CSV
  const handleUploadCsvFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      toast.error("Only CSV files are allowed.");
      e.target.value = "";
      return;
    }
    setSelectedCouponCsv(selectedFile);
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Segment Name */}
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

        {/* Segment Name Arabic */}
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

        {/* Description */}
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

        {/* Description Arabic */}
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

        {/* Business Unit */}
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            name="business_unit_id"
            label="Business Unit"
            SelectProps={{ multiple: false }}
            value={selectedBusinessUnitId}
            onChange={(e) => setSelectedBusinessUnitId(e.target.value)}
          >
            {businessUnits.map((bu) => (
              <MenuItem key={bu.id} value={bu.id}>
                {bu.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Bulk Upload Customer Segment csv */}
        {drawerType == DRAWER_TYPE_BULK_UPLOAD ? (
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                sx={{ width: 150, height: 35 }}
              >
                Upload File
                <input
                  type="file"
                  hidden
                  name="file"
                  onChange={(e) => handleUploadCsvFile(e)}
                  accept=".csv,text/csv"
                />
              </Button>
              {selectedCouponCsv && selectedCouponCsv?.name && (
                <Box>{selectedCouponCsv?.name}</Box>
              )}
            </Box>
          </Grid>
        ) : customers.length > 0 ? (
          <Grid item xs={12}>
            <SearchAutoSuggest
              label="Add Customers"
              inputTextChange={handleAddCustomerInputChange}
              options={options}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
              loading={autoSuggestLoading}
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
