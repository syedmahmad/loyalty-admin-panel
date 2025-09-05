"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Formik, Form } from "formik";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { GET, POST, PUT } from "@/utils/AxiosUtility";
import { RichTextEditor } from "@/components/TextEditor";

type Tier = {
  id: number;
  name: string;
};

type BusinessUnit = {
  id: number;
  name: string;
};

type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
};

const EditTierForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id");
  const theme = useTheme();
  // const [rules, setRules] = useState<any[]>([]);
  // const [selectedRules, setSelectedRules] = useState<number[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedId, setSelectedId] = useState<string>(paramId || "");
  const [tierData, setTierData] = useState<any>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [description, setDescription] = useState<string>("");
  const [benefitsInputs, setBenefitsInputs] = useState<Benefit[]>([
    { name_en: "", name_ar: "", icon: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // const fetchRules = async () => {
  //   const res = await GET('/rules');
  //   if (res?.data) {
  //     setRules(res.data);
  //   }
  // };

  const userId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  const addBenefitInput = () => {
    setBenefitsInputs([
      ...benefitsInputs,
      { name_en: "", name_ar: "", icon: "" },
    ]);
  };

  useEffect(() => {
    const resolveAllPromises = async () => {
      const fetchTiersAndBUs = async () => {
        const [tierListRes, buRes] = await Promise.all([
          GET(`/tiers/${userId}`),
          GET(`/business-units/${userId}`),
        ]);
        setTiers(tierListRes?.data.tiers || []);
        setBusinessUnits(buRes?.data || []);

        if (paramId) {
          await fetchTierById(paramId);
        }

        setInitializing(false);
      };

      await Promise.all([fetchTiersAndBUs()]);
    };

    resolveAllPromises();
  }, [paramId]);

  const fetchTierById = async (id: string) => {
    setLoading(true);
    const res = await GET(`/tiers/single/${id}`);
    if (!res?.data) {
      toast.error("Tier not found");
      return;
    }

    setSelectedId(id);
    setTierData({
      name: res.data.name,
      min_points: res.data.min_points,
      // points_conversion_rate: res.data.points_conversion_rate,
      business_unit_id: res.data.business_unit_id.toString(),
    });
    setDescription(res.data.description || "");
    setBenefitsInputs(
      Array.isArray(res.data.benefits)
        ? res.data.benefits.map((item: any) =>
            typeof item === "string"
              ? { name_en: item, name_ar: "", icon: "" }
              : item
          )
        : []
    );

    // setSelectedRules((res.data.rule_targets || []).map((t: any) => t.rule_id));
    setLoading(false);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Tier name is required"),
    min_points: Yup.number().required("Minimum points required"),
    //  conversion_rate: Yup.number()
    //       .required('Conversion rate is required')
    //       .min(0, 'Conversion rate must be a positive number'),
    business_unit_id: Yup.string().required("Business unit is required"),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      description: description || "",
      benefits: benefitsInputs || [],
      business_unit_id: values.business_unit_id,
      min_points: +values.min_points,
      // points_conversion_rate: +values.conversion_rate,
      updated_by: userId,
      // rule_targets: selectedRules.map((rule_id) => ({ rule_id })),
    };

    const res = await PUT(`/tiers/${selectedId}`, payload);
    if (res?.status !== 200) {
      toast.error("Failed to update tier");
    } else {
      toast.success("Tier updated!");
      onSuccess();
    }
    setLoading(false);
  };
  if (initializing) {
    return (
      <Box mt={6} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      setUploadingIndex(index);
      const res = await POST("/tiers/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data.success) {
        setBenefitsInputs((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, icon: res?.data.uploaded_url } : item
          )
        );
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingIndex(null); // stop loader
    }
  };

  return (
    <>
      {/* <Tooltip title="Go Back">
        <IconButton onClick={() => router.back()} sx={{ width: 120, color: theme.palette.primary.main }}>
          <ArrowBackIcon /> &nbsp; Go Back
        </IconButton>
      </Tooltip>
      <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ✏ Edit Tier
        </Typography> */}

      {!selectedId && (
        <Grid container spacing={2} sx={{ mb: 1, width: "100%" }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Tier"
              value={selectedId}
              onChange={(e) => fetchTierById(e.target.value)}
              margin="normal"
            >
              {tiers.map((tier) => (
                <MenuItem key={tier.id} value={tier.id}>
                  {tier.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}

      {tierData && (
        <Formik
          enableReinitialize
          initialValues={tierData}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form noValidate>
              <Grid container spacing={2}>
                {/* Tier Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Tier Name"
                    value={values.name}
                    onChange={handleChange}
                    error={!!touched.name && !!errors.name}
                    helperText={
                      touched.name && typeof errors.name === "string"
                        ? errors.name
                        : undefined
                    }
                  />
                </Grid>

                {/* <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="points_conversion_rate"
                      label="Points Conversion Rate"
                      value={values.points_conversion_rate}
                      onChange={handleChange}
                      error={!!touched.points_conversion_rate && !!errors.points_conversion_rate}
                      helperText={touched.points_conversion_rate && typeof errors.points_conversion_rate === 'string' ? errors.points_conversion_rate : undefined}
                    />
                  </Grid> */}

                {/* Min Points */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="min_points"
                    label="Min Points"
                    type="number"
                    value={values.min_points}
                    onChange={handleChange}
                    error={!!touched.min_points && !!errors.min_points}
                    helperText={
                      touched.name && typeof errors.name === "string"
                        ? errors.name
                        : undefined
                    }
                  />
                </Grid>

                {/* Business Unit */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    name="business_unit_id"
                    label="Business Unit"
                    value={values.business_unit_id}
                    onChange={handleChange}
                    error={
                      !!touched.business_unit_id && !!errors.business_unit_id
                    }
                    helperText={
                      touched.name && typeof errors.name === "string"
                        ? errors.name
                        : undefined
                    }
                  >
                    {businessUnits.map((bu) => (
                      <MenuItem key={bu.id} value={bu.id}>
                        {bu.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Attach Rules"
                      SelectProps={{ multiple: true }}
                      value={selectedRules}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedRules(Array.isArray(value) ? value : []);
                      }}
                    >
                      {rules.map((rule) => (
                        <MenuItem key={rule.id} value={rule.id}>
                          {`${rule.name.toUpperCase()} — ${rule.rule_type} ${rule.max_points_limit}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid> */}

                {/* Benefits */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Benefits (optional)
                  </Typography>

                  {benefitsInputs.map((input, index) => (
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      gap={1}
                      key={index + 1}
                      mb={2}
                      p={2}
                      border="1px solid #ddd"
                      borderRadius="12px"
                      boxShadow="0 2px 5px rgba(0,0,0,0.05)"
                    >
                      <Box
                        display="flex"
                        gap={2}
                        flex={1}
                        flexDirection="column"
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            size="small"
                            sx={{ width: 150, height: 35 }}
                            disabled={uploadingIndex === index}
                          >
                            {/* {input.icon ? "Change Icon" : "Upload Icon"} */}
                            {uploadingIndex === index ? (
                              <CircularProgress size={18} />
                            ) : input.icon ? (
                              "Change Icon"
                            ) : (
                              "Upload Icon"
                            )}
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, index)}
                            />
                          </Button>
                          {input.icon && (
                            <Box mt={1}>
                              <img
                                src={input.icon}
                                alt="Benefit Icon"
                                style={{
                                  width: 33,
                                  height: 33,
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                        <TextField
                          fullWidth
                          name="benefits"
                          label={`Benefit ${index + 1}`}
                          value={input.name_en}
                          onChange={(e) => {
                            const newInputs = [...benefitsInputs];
                            newInputs[index].name_en = e.target.value;
                            setBenefitsInputs(newInputs);
                          }}
                        />
                        <TextField
                          fullWidth
                          name="benefits"
                          label={`Arabic Benefit ${index + 1}`}
                          value={input.name_ar}
                          onChange={(e) => {
                            const newInputs = [...benefitsInputs];
                            newInputs[index].name_ar = e.target.value;
                            setBenefitsInputs(newInputs);
                          }}
                        />
                      </Box>

                      {index === 0 ? (
                        <IconButton onClick={addBenefitInput}>
                          <AddIcon fontSize="small" color="primary" />
                        </IconButton>
                      ) : (
                        <IconButton>
                          <DeleteIcon
                            fontSize="small"
                            color="error"
                            onClick={() => {
                              setBenefitsInputs(
                                benefitsInputs.filter((_, i) => i !== index)
                              );
                            }}
                          />
                        </IconButton>
                      )}
                    </Box>
                  ))}

                  {/* <Typography variant="subtitle1" gutterBottom>
                      Benefits (optional)
                    </Typography>
                    <RichTextEditor value={benefits} setValue={setBenefits} language="en" /> */}
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Description (optional)
                  </Typography>
                  <RichTextEditor
                    value={description}
                    setValue={setDescription}
                    language="en"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      type="submit"
                      variant="outlined"
                      disabled={loading}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Update Tier"}
                    </Button>
                  </Box>

                  <br />
                  <br />
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default EditTierForm;
