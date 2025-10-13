"use client";

import { RichTextEditor } from "@/components/TextEditor";
import { DELETE, GET, POST } from "@/utils/AxiosUtility";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { BusinessUnit, OfferFormValues } from "../types";

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

type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
  // icon_ar: string;
  drawerType?: string;
};

const CreateOfferForm = ({ onSuccess, handleDrawerWidth, drawerType }: any) => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [benefits, setBenefits] = useState<string>("");
  const [termsAndConditionsEn, setTermsAndConditionsEn] = useState<string>("");
  const [termsAndConditionsAr, setTermsAndConditionsAr] = useState<string>("");
  const [segments, setSegments] = useState([]);
  const [removing, setRemoving] = useState(false);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});

  /** Multiple Benefits with icon */
  const [benefitsInputs, setBenefitsInputs] = useState<Benefit[]>([
    { name_en: "", name_ar: "", icon: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  /** images for Desktop and mobile start */
  const [images, setImages] = useState({
    desktop: { en: "", ar: "" },
    mobile: { en: "", ar: "" },
  });

  const [uploading, setUploading] = useState<{
    desktop: { en: boolean; ar: boolean };
    mobile: { en: boolean; ar: boolean };
  }>({
    desktop: { en: false, ar: false },
    mobile: { en: false, ar: false },
  });
  /** images for Desktop and mobile end*/

  const fetchCustomerSegments = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(`/customer-segments/${clientInfo.id}`);
    setSegments(res?.data.data || []);
  };

  const created_by =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  const formik = useFormik<OfferFormValues>({
    initialValues: {
      offer_title: "",
      offer_title_ar: "",
      business_unit_ids: [] as number[],
      benefits: "",
      date_from: "",
      date_to: "",
      status: 1,
      customer_segment_ids: [] as number[],
      description_en: "",
      description_ar: "",
      all_users: 0,
    },
    validationSchema: Yup.object({
      offer_title: Yup.string().required("Offer title is required"),
      business_unit_ids: Yup.array().min(
        1,
        "Select at least one business unit"
      ),
      date_from: Yup.date().required("Start date is required"),
      date_to: Yup.date()
        .min(Yup.ref("date_from"), "End date must be after start date")
        .required("End date is required"),
      status: Yup.number().required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      await handleSubmit(values, resetForm);
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit: onFormSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    setErrors,
  } = formik;

  const loadData = async () => {
    setLoading(true);
    try {
      const [buData] = await Promise.all([fetchBusinessUnits()]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchCustomerSegments();
  }, []);

  const handleSubmit = async (
    values: OfferFormValues,
    resetForm: () => void
  ) => {
    // setLoading(true);
    const payloads = values.business_unit_ids.map((buId: number) => ({
      offer_title: values.offer_title,
      offer_title_ar: values.offer_title_ar,
      date_from: values.date_from,
      date_to: values.date_to,
      status: values.status,
      benefits: benefitsInputs || [],
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
      customer_segment_ids: values.customer_segment_ids,
      description_en: values.description_en,
      description_ar: values.description_ar,
      terms_and_conditions_en: termsAndConditionsEn || "",
      terms_and_conditions_ar: termsAndConditionsAr || "",
      all_users: values.all_users,
      images: images,
    }));

    const responses = await Promise.all(
      payloads.map(async (payload) => {
        try {
          const res = await POST("/offers", payload);
          return { success: true, status: res?.status, data: res?.data };
        } catch (error: any) {
          return {
            success: false,
            status: error?.response?.status || 500,
            message: error?.response?.data?.message || "Unknown error",
          };
        }
      })
    );
    const anyFailed = responses.some((res) => res?.status !== 201);
    if (anyFailed) {
      // setLoading(false);
      toast.error("failed to create offer");
    } else {
      toast.success("offer created successfully!");
      resetForm();
      setBenefits("");
      // setLoading(false);
      onSuccess();
    }
  };

  const addBenefitInput = () => {
    setBenefitsInputs([
      ...benefitsInputs,
      { name_en: "", name_ar: "", icon: "" },
    ]);
  };

  const handleArabictranslate = async (
    key: string,
    value: string,
    richEditor: boolean = false
  ) => {
    try {
      if (value) {
        setTranslationLoading((prev) => ({ ...prev, [key]: true }));
        const res = await POST("/openai/translate-to-arabic", { value });
        if (res?.data.status) {
          if (richEditor) {
            setTermsAndConditionsAr(res?.data?.data);
          } else {
            setFieldValue(key, res?.data?.data);
          }
          return res?.data?.data;
        }
        return "";
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
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    iconType: string
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
          prev.map(
            (item, i) =>
              i === index ? { ...item, icon: res?.data.uploaded_url } : item
            // i === index ? { ...item, [iconType]: res?.data.uploaded_url } : item
          )
        );
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingIndex(null); // stop loader
    }
  };

  const uploadImageToBucket = async (
    e: React.ChangeEvent<HTMLInputElement>,
    device: "desktop" | "mobile",
    lang: "en" | "ar"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      toast.error("File size should not exceed 5 MB");
      return;
    }

    setUploading((prev) => ({
      ...prev,
      [device]: { ...prev[device], [lang]: true },
    }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await POST("/offers/upload-file-to-bucket", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data.success) {
        setImages((prev) => ({
          ...prev,
          [device]: { ...prev[device], [lang]: res.data.uploaded_url },
        }));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading((prev) => ({
        ...prev,
        [device]: { ...prev[device], [lang]: false },
      }));
    }
  };

  const removeFileFromBucket = async (
    url: string,
    device: "desktop" | "mobile",
    lang: "en" | "ar"
  ) => {
    setRemoving(true);
    try {
      if (url) {
        const response = await DELETE(`/offers/remove-file`, {
          params: { url },
        });
        if (response?.status == 200 && response?.data.url) {
          setImages((prev) => ({
            ...prev,
            [device]: { ...prev[device], [lang]: "" },
          }));
          toast.success("File removed successfully!");
        }
      }
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    } finally {
      setRemoving(false);
    }
  };

  const removeBenefitIconFromBucket = async (index: number, url: string) => {
    setRemoving(true);
    try {
      if (url) {
        const response = await DELETE(`/offers/remove-file`, {
          params: { url },
        });
        if (response?.status == 200 && response?.data.url) {
          setBenefitsInputs((prev) =>
            prev.map((benefit, i) =>
              i === index ? { ...benefit, icon: "" } : benefit
            )
          );
          toast.success("File removed successfully!");
        }
      }
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Offer Title English */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Offer Title English"
              value={values.offer_title}
              name="offer_title"
              onChange={handleChange}
              onBlur={(e) =>
                handleArabictranslate("offer_title_ar", e.target.value)
              }
              error={!!touched.offer_title && !!errors.offer_title}
              helperText={touched.offer_title && errors.offer_title}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {translationLoading["offer_title_ar"] && (
                      <CircularProgress size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Offer Title Arabic */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Offer Title Arabic"
              value={values.offer_title_ar}
              name="offer_title_ar"
              onChange={handleChange}
              error={!!touched.offer_title_ar && !!errors.offer_title_ar}
              helperText={touched.offer_title_ar && errors.offer_title_ar}
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
              error={!!touched.business_unit_ids && !!errors.business_unit_ids}
              helperText={touched.business_unit_ids && errors.business_unit_ids}
            >
              {businessUnits?.map((bu) => (
                <MenuItem key={bu.id} value={bu.id}>
                  {bu.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Expiry Date */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  fullWidth
                  label="Date From"
                  name="date_from"
                  InputLabelProps={{ shrink: true }}
                  value={values.date_from}
                  onChange={handleChange}
                  error={!!touched.date_from && !!errors.date_from}
                  helperText={touched.date_from && errors.date_from}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  type="date"
                  fullWidth
                  label="Date To"
                  name="date_to"
                  InputLabelProps={{ shrink: true }}
                  value={values.date_to}
                  onChange={handleChange}
                  error={!!touched.date_to && !!errors.date_to}
                  helperText={touched.date_to && errors.date_to}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Apply to all users */}
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="subtitle1">Apply to all users</Typography>
              </Grid>
              <Grid item>
                <Switch
                  name="all_users"
                  color="primary"
                  checked={values.all_users === 1}
                  onChange={(e) =>
                    setFieldValue("all_users", e.target.checked ? 1 : 0)
                  }
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Customer Segments */}
          {values.all_users === 0 && (
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={segments}
                getOptionLabel={(option: any) => option.name}
                value={segments.filter((s: any) =>
                  values.customer_segment_ids.includes(s.id)
                )}
                onChange={(event, newValue) => {
                  setFieldValue(
                    "customer_segment_ids",
                    newValue.map((item: any) => item.id)
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer Segments"
                    error={Boolean(
                      touched.customer_segment_ids &&
                        errors.customer_segment_ids
                    )}
                    helperText={
                      touched.customer_segment_ids &&
                      errors.customer_segment_ids
                        ? errors.customer_segment_ids
                        : ""
                    }
                  />
                )}
              />
            </Grid>
          )}

          {/* Is Active */}
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="subtitle1">Is Active</Typography>
              </Grid>
              <Grid item>
                <Switch
                  name="isActive"
                  color="primary"
                  checked={values.status === 1}
                  onChange={(e) =>
                    setFieldValue("status", e.target.checked ? 1 : 0)
                  }
                />
              </Grid>
            </Grid>
          </Grid>

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
                    {/* English Image */}

                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      size="small"
                      sx={{ width: 150, height: 35 }}
                      disabled={uploadingIndex === index}
                    >
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
                        onChange={(e) => handleFileChange(e, index, "icon")}
                      />
                    </Button>
                    {input.icon && (
                      <Box mt={1} display="flex" alignItems="center" gap={3}>
                        <img
                          src={input.icon}
                          alt="Benefit Icon"
                          style={{ width: 33, height: 33, borderRadius: 2 }}
                        />

                        <Button
                          variant="text"
                          color="error"
                          onClick={() =>
                            removeBenefitIconFromBucket(index, input.icon)
                          }
                        >
                          Remove
                        </Button>
                      </Box>
                    )}

                    {/* Arabic Image */}
                    {/* <div>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        size="small"
                        sx={{ width: 150, height: 35 }}
                        disabled={uploadingIndex === index}
                      >
                        {uploadingIndex === index ? (
                          <CircularProgress size={18} />
                        ) : input.icon_ar ? (
                          "Change Arabic Icon"
                        ) : (
                          "Upload Arabic Icon "
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, index, "icon_ar")
                          }
                        />
                      </Button>
                      {input.icon_ar && (
                        <Box mt={1}>
                          <img
                            src={input.icon}
                            alt="Benefit Icon"
                            style={{ width: 33, height: 33, borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </div> */}
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
          </Grid>

          {/* Desktop and mobile image start*/}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Desktop image (English)
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                sx={{ width: 150, height: 35 }}
              >
                {uploading.desktop.en ? (
                  <CircularProgress size={18} />
                ) : images.desktop.en ? (
                  "Change Image"
                ) : (
                  "Upload Image"
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => uploadImageToBucket(e, "desktop", "en")}
                />
              </Button>

              {images.desktop.en && (
                <Box mt={1} display="flex" alignItems="center" gap={3}>
                  <img
                    src={images.desktop.en}
                    alt="Desktop English Image"
                    style={{ width: 33, height: 33, borderRadius: 2 }}
                  />

                  <Button
                    variant="text"
                    color="error"
                    onClick={() =>
                      removeFileFromBucket(images?.desktop?.en, "desktop", "en")
                    }
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Desktop image (Arabic)
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                sx={{ width: 150, height: 35 }}
              >
                {uploading.desktop.ar ? (
                  <CircularProgress size={18} />
                ) : images.desktop.ar ? (
                  "Change Image"
                ) : (
                  "Upload Image"
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => uploadImageToBucket(e, "desktop", "ar")}
                />
              </Button>

              {images.desktop.ar && (
                <Box mt={1} display="flex" alignItems="center" gap={3}>
                  <img
                    src={images.desktop.ar}
                    alt="Desktop Arabic Image"
                    style={{ width: 33, height: 33, borderRadius: 2 }}
                  />
                  <Button
                    variant="text"
                    color="error"
                    onClick={() =>
                      removeFileFromBucket(images?.desktop?.ar, "desktop", "ar")
                    }
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Mobile image (English)
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                sx={{ width: 150, height: 35 }}
              >
                {uploading.mobile.en ? (
                  <CircularProgress size={18} />
                ) : images.mobile.en ? (
                  "Change Image"
                ) : (
                  "Upload Image"
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => uploadImageToBucket(e, "mobile", "en")}
                />
              </Button>

              {images.mobile.en && (
                <Box mt={1} display="flex" alignItems="center" gap={3}>
                  <img
                    src={images.mobile.en}
                    alt="Mobile English Image"
                    style={{ width: 33, height: 33, borderRadius: 2 }}
                  />
                  <Button
                    variant="text"
                    color="error"
                    onClick={() =>
                      removeFileFromBucket(images?.mobile?.en, "mobile", "en")
                    }
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Mobile image (Arabic)
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                sx={{ width: 150, height: 35 }}
              >
                {uploading.mobile.ar ? (
                  <CircularProgress size={18} />
                ) : images.mobile.ar ? (
                  "Change Image"
                ) : (
                  "Upload Image"
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => uploadImageToBucket(e, "mobile", "ar")}
                />
              </Button>

              {images.mobile.ar && (
                <Box mt={1} display="flex" alignItems="center" gap={3}>
                  <img
                    src={images.mobile.ar}
                    alt="Mobile Arabic Image"
                    style={{ width: 33, height: 33, borderRadius: 2 }}
                  />
                  <Button
                    variant="text"
                    color="error"
                    onClick={() =>
                      removeFileFromBucket(images?.mobile?.ar, "mobile", "ar")
                    }
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
          {/* Desktop and mobile image end */}

          {/* Description English */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description (English)
            </Typography>
            <TextField
              label="Description English"
              variant="outlined"
              name="description_en"
              value={values.description_en}
              onChange={handleChange}
              onBlur={(e) =>
                handleArabictranslate("description_ar", e.target.value)
              }
              fullWidth
              multiline
              rows={4}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {translationLoading["description_ar"] && (
                      <CircularProgress size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Description Arabic */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description (Arabic)
            </Typography>
            <TextField
              label="Description Arabic"
              variant="outlined"
              name="description_ar"
              value={values.description_ar}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>

          {/* Terms And Conditions English*/}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Terms And Conditions (English)
            </Typography>
            <RichTextEditor
              value={termsAndConditionsEn}
              setValue={setTermsAndConditionsEn}
              language="en"
              height={250}
              onBlur={() =>
                handleArabictranslate(
                  "termsAndConditionsAr",
                  termsAndConditionsEn,
                  true
                )
              }
              translationLoading={translationLoading["termsAndConditionsAr"]}
            />
          </Grid>

          {/* Terms And Conditions Arabic*/}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Terms And Conditions (Arabic)
            </Typography>
            <RichTextEditor
              value={termsAndConditionsAr}
              setValue={setTermsAndConditionsAr}
              language="en"
              height={250}
            />
          </Grid>

          <Grid item xs={12}>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="primary"
                type="submit"
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={24} /> : "Create Offer"}
              </Button>
            </Box>
          </Grid>
          <br />
          <br />
        </Grid>
      </form>
    </>
  );
};

export default CreateOfferForm;
