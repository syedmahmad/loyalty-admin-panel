"use client";

import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  useTheme,
  Box,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { RichTextEditor } from "@/components/TextEditor";
import { useRouter } from "next/navigation";

type BusinessUnit = {
  id: number;
  name: string;
};

const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const response = await GET(`/business-units/${clientInfo.id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

// const fetchRules = async (): Promise<any[]> => {
//   const response = await GET('/rules');
//   if (response?.status !== 200) {
//     throw new Error('Failed to fetch rules');
//   }
//   return response.data;
// };

type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
};

const CreateTierForm = ({ onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [description, setDescription] = useState<string>("");
  // const [rules, setRules] = useState<any[]>([]);
  // const [selectedRules, setSelectedRules] = useState<number[]>([]);
  const theme = useTheme();
  const router = useRouter();

  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [benefitsInputs, setBenefitsInputs] = useState<Benefit[]>([
    { name_en: "", name_ar: "", icon: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const created_by =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  const loadData = async () => {
    setLoading(true);
    try {
      const [buData] = await Promise.all([
        fetchBusinessUnits(),
        // fetchRules(),
      ]);
      setBusinessUnits(buData);
      // setRules(ruleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addBenefitInput = () => {
    setBenefitsInputs([
      ...benefitsInputs,
      { name_en: "", name_ar: "", icon: "" },
    ]);
  };

  const initialValues = {
    name: "",
    min_points: "",
    benefits: "",
    description: "",
    business_unit_ids: [] as number[],
    // conversion_rate: 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Tier name is required"),
    min_points: Yup.number().required("Minimum points required"),
    // conversion_rate: Yup.number()
    //   .required('Conversion rate is required')
    //   .min(0, 'Conversion rate must be a positive number'),
    business_unit_ids: Yup.array()
      .min(1, "At least one business unit is required")
      .of(Yup.number().required()),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    resetForm: () => void
  ) => {
    setLoading(true);
    const payloads = values.business_unit_ids.map((buId) => ({
      name: values.name,
      min_points: +values.min_points,
      description: description || "",
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
      benefits: benefitsInputs || [],
    }));

    const responses = await Promise.all(
      payloads.map((payload) => POST("/tiers", payload))
    );

    const anyFailed = responses.some((res) => res?.status !== 201);

    if (anyFailed) {
      setLoading(false);
      toast.error("Some tiers failed to create");
    } else {
      toast.success("All tiers created successfully!");
      resetForm();
      // setBenefits("");
      setLoading(false);
      // router.push('/tiers/view');
      onSuccess();
    }
  };

  const handleArabictranslate = async (
    key: string,
    value: string,
    richEditor: boolean = false
  ) => {
    try {
      setTranslationLoading((prev) => ({ ...prev, [key]: true }));
      const res = await POST("/openai/translate-to-arabic", { value });
      if (res?.data.status) {
        return res?.data?.data;
      }
      return "";
    } catch (error: any) {
      return {
        success: false,
        status: error?.response?.status || 500,
        message: error?.response?.data?.message || "Unknown error",
      };
    } finally {
      setTranslationLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

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
      <Card sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ➕ Create New Tier
        </Typography> */}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
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
                  helperText={touched.name && errors.name}
                />
              </Grid>
              {/* <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="conversion_rate"
                    label="Points Conversion Rate"
                    type="number"
                    value={values.conversion_rate || ''}
                    onChange={handleChange}
                    error={!!touched.conversion_rate && !!errors.conversion_rate}
                    helperText={touched.conversion_rate && errors.conversion_rate}
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
                  helperText={touched.min_points && errors.min_points}
                />
              </Grid>

              {/* Business Units */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  name="business_unit_ids"
                  label="Business Units"
                  SelectProps={{ multiple: true }}
                  value={values.business_unit_ids}
                  onChange={handleChange}
                  error={
                    !!touched.business_unit_ids && !!errors.business_unit_ids
                  }
                  helperText={
                    touched.business_unit_ids && errors.business_unit_ids
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
                    name="rule_targets"
                    label="Attach Rules"
                    SelectProps={{ multiple: true }}
                    value={selectedRules}
                    onChange={(e) => {
                      setSelectedRules(
                        typeof e.target.value === 'string'
                          ? e.target.value.split(',').map(Number)
                          : e.target.value
                      )
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
                    <Box display="flex" gap={2} flex={1} flexDirection="column">
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
                              style={{ width: 33, height: 33, borderRadius: 2 }}
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
                        onBlur={async (e) => {
                          if (e.target.value.trim()) {
                            const translated = await handleArabictranslate(
                              `benefit_${index}`,
                              e.target.value
                            );

                            if (translated?.success !== false) {
                              const newInputs = [...benefitsInputs];
                              newInputs[index].name_ar = translated || "";
                              setBenefitsInputs(newInputs);
                            }
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {translationLoading[`benefit_${index}`] && (
                                <CircularProgress size={20} />
                              )}
                            </InputAdornment>
                          ),
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
                    variant="outlined"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Create Tier"}
                  </Button>
                </Box>
              </Grid>
              <br />
              <br />
              {/* <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    onClick={() => router.push('view')}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Go Back
                  </Button> */}
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default CreateTierForm;
