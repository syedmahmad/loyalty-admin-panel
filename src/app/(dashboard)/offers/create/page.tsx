"use client";

import { RichTextEditor } from "@/components/TextEditor";
import { STATION_TYPES } from "@/constants/constants";
import { businessUnitService } from "@/services/businessUnitService";
import { openAIService } from "@/services/openAiService";
import { tenantService } from "@/services/tenantService";
import { Language } from "@/types/language.type";
import { Benefit, UploadingState } from "@/types/offer.type";
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

const CreateOfferForm = ({ onSuccess, handleDrawerWidth, drawerType }: any) => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [benefits, setBenefits] = useState<string>("");
  const [segments, setSegments] = useState([]);
  const [removing, setRemoving] = useState(false);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [languages, setLanguages] = useState<Language[]>([]);

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

  const [uploading, setUploading] = useState<UploadingState>({
    desktop: {},
    mobile: {},
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
      offerBasicInfo: { locales: {} },
      business_unit_ids: [] as number[],
      benefits: "",
      date_from: "",
      date_to: "",
      status: 1,
      customer_segment_ids: [] as number[],
      all_users: 0,
      station_type: "",
      show_in_app: 0,
    },
    validationSchema: Yup.object({
      offerBasicInfo: Yup.object().shape({
        locales: Yup.object().shape(
          Object.fromEntries(
            languages.map((lang) => [
              lang.id,
              Yup.object().shape({
                title: Yup.string().required(
                  `Offer title (${lang.name}) is required`
                ),
                subtitle: Yup.string().required(
                  `Offer subtitle (${lang.name}) is required`
                ),
              }),
            ])
          )
        ),
      }),
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
      const [buData] = await Promise.all([
        businessUnitService.getBusinessUnit(),
      ]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchCustomerSegments();
    const getLanguages = async () => {
      try {
        const languageResponse = await tenantService.getTenantById();
        const allLanguages =
          languageResponse?.languages?.map((cl: any) => cl?.language) || [];

        const english = allLanguages.find(
          (lang: { code: string }) => lang.code === "en"
        );

        const others = allLanguages.filter(
          (lang: { code: string }) => lang.code !== "en"
        );
        const englishFirst = english ? [english, ...others] : allLanguages;
        setLanguages(englishFirst);
      } catch (error) {
        console.error("Error fetching country language:", error);
      }
    };
    getLanguages();
  }, []);

  const handleSubmit = async (
    values: OfferFormValues,
    resetForm: () => void
  ) => {
    setLoading(true);
    const payloads = values.business_unit_ids.map((buId: number) => ({
      date_from: values.date_from,
      date_to: values.date_to,
      status: values.status,
      benefits: benefitsInputs || [],
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
      customer_segment_ids: values.customer_segment_ids,
      all_users: values.all_users,
      images: images,
      station_type: values.station_type,
      locales: Object.entries(values.offerBasicInfo.locales).map(
        ([languageId, localization]) => ({
          languageId,
          title: localization.title,
          subtitle: localization.subtitle,
          description: localization.description,
          term_and_condition: localization.term_and_condition,
          benefits: localization.benefits,
          desktop_image: localization.desktop_image,
          mobile_image: localization.mobile_image,
        })
      ),
      show_in_app: values.show_in_app,
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
      setLoading(false);
      toast.error("failed to create offer");
    } else {
      toast.success("offer created successfully!");
      resetForm();
      setBenefits("");
      setLoading(false);
      onSuccess();
    }
  };

  const addBenefitInput = () => {
    setBenefitsInputs([
      ...benefitsInputs,
      { name_en: "", name_ar: "", icon: "" },
    ]);
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

  const uploadImageToBucket = async (
    e: React.ChangeEvent<HTMLInputElement>,
    device: "desktop" | "mobile",
    langId: string
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
      [device]: { ...prev[device], [langId]: true },
    }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await POST("/offers/upload-file-to-bucket", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data.success) {
        setFieldValue(
          `offerBasicInfo.locales.${langId}.${device}_image`,
          res.data.uploaded_url
        );
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading((prev) => ({
        ...prev,
        [device]: { ...prev[device], [langId]: false },
      }));
    }
  };

  const removeFileFromBucket = async (
    url: string,
    device: "desktop" | "mobile",
    langId: string
  ) => {
    setRemoving(true);
    try {
      if (url) {
        const response = await DELETE(`/offers/remove-file`, {
          params: { url },
        });
        if (response?.status == 200 && response?.data.url) {
          setFieldValue(`offerBasicInfo.locales.${langId}.${device}_image`, "");
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

  const handleTranslateText = async (
    targetLang: string,
    englishText: string
  ): Promise<string> => {
    try {
      const payload = {
        text: englishText,
        targetLanguage: [targetLang],
        sourceLanguage: "en",
      };
      setTranslationLoading((prev) => ({ ...prev, [targetLang]: true }));
      const response = await openAIService.translateText(payload);
      return response.translatedText?.[targetLang] || "";
    } catch (error) {
      console.error(`Translation failed for ${targetLang}:`, error);
      return "";
    } finally {
      setTranslationLoading((prev) => ({ ...prev, [targetLang]: false }));
    }
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Offer Title */}
          {languages.length > 0 &&
            languages.map((singleLanguage: Language, index) => {
              const langId = singleLanguage.id;
              const langCode = singleLanguage.code;
              const fieldName = `offerBasicInfo.locales.${langId}.title`;
              return (
                <Grid item xs={12} key={index}>
                  <TextField
                    fullWidth
                    name={fieldName}
                    label={`Offer title (${singleLanguage.name})`}
                    value={values.offerBasicInfo.locales[langId]?.title || ""}
                    onChange={handleChange}
                    error={Boolean(
                      errors.offerBasicInfo?.locales?.[langId]?.title
                    )}
                    helperText={
                      errors.offerBasicInfo?.locales?.[langId]?.title
                        ? String(errors.offerBasicInfo.locales[langId].title)
                        : ""
                    }
                    onBlur={async (e) => {
                      if (langCode === "en") {
                        const englishText = e.target.value;
                        if (!englishText.trim()) return;

                        for (const lang of languages) {
                          const targetLangId = lang?.id;
                          const targetLang = lang?.code;
                          if (targetLang !== "en") {
                            try {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`title_${targetLang}`]: true,
                              }));

                              const translatedText = await handleTranslateText(
                                targetLang,
                                englishText
                              );
                              setFieldValue(
                                `offerBasicInfo.locales.${targetLangId}.title`,
                                translatedText
                              );
                            } catch (err) {
                              console.error(
                                `Translation failed for ${targetLang}`,
                                err
                              );
                            } finally {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`title_${targetLang}`]: false,
                              }));
                            }
                          }
                        }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {translationLoading[`title_${langCode}`] && (
                            <CircularProgress size={20} />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              );
            })}

          {/* Offer Subtitle */}
          {languages.length > 0 &&
            languages.map((singleLanguage: Language, index) => {
              const langId = singleLanguage.id;
              const langCode = singleLanguage.code;
              const fieldName = `offerBasicInfo.locales.${langId}.subtitle`;
              return (
                <Grid item xs={12} key={index}>
                  <TextField
                    fullWidth
                    name={fieldName}
                    label={`Offer subtitle (${singleLanguage.name})`}
                    value={
                      values.offerBasicInfo.locales[langId]?.subtitle || ""
                    }
                    onChange={handleChange}
                    error={Boolean(
                      errors.offerBasicInfo?.locales?.[langId]?.subtitle
                    )}
                    helperText={
                      errors.offerBasicInfo?.locales?.[langId]?.subtitle
                        ? String(errors.offerBasicInfo.locales[langId].subtitle)
                        : ""
                    }
                    onBlur={async (e) => {
                      if (langCode === "en") {
                        const englishText = e.target.value;
                        if (!englishText.trim()) return;

                        for (const lang of languages) {
                          const targetLangId = lang?.id;
                          const targetLang = lang?.code;
                          if (targetLang !== "en") {
                            try {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`subtitle_${targetLang}`]: true,
                              }));

                              const translatedText = await handleTranslateText(
                                targetLang,
                                englishText
                              );
                              setFieldValue(
                                `offerBasicInfo.locales.${targetLangId}.subtitle`,
                                translatedText
                              );
                            } catch (err) {
                              console.error(
                                `Translation failed for ${targetLang}`,
                                err
                              );
                            } finally {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`subtitle_${targetLang}`]: false,
                              }));
                            }
                          }
                        }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {translationLoading[`subtitle_${langCode}`] && (
                            <CircularProgress size={20} />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              );
            })}

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

          {/* Station Type */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              name="station_type"
              label="Station Type"
              value={values.station_type}
              onChange={handleChange}
              error={!!touched.station_type && !!errors.station_type}
              helperText={touched.station_type && errors.station_type}
            >
              {STATION_TYPES?.map((singleStation) => (
                <MenuItem key={singleStation.value} value={singleStation.value}>
                  {singleStation.label}
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

          {/* Show On Apps */}
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="subtitle1">Show in App</Typography>
              </Grid>
              <Grid item>
                <Switch
                  name="showInApp"
                  color="primary"
                  checked={values.show_in_app === 1}
                  onChange={(e) =>
                    setFieldValue("show_in_app", e.target.checked ? 1 : 0)
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

            {benefitsInputs.map((input, benefitIndex) => (
              <Box
                display="flex"
                alignItems="flex-start"
                gap={1}
                key={benefitIndex + 1}
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
                      disabled={uploadingIndex === benefitIndex}
                    >
                      {uploadingIndex === benefitIndex ? (
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
                        onChange={(e) =>
                          handleFileChange(e, benefitIndex, "icon")
                        }
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
                            removeBenefitIconFromBucket(
                              benefitIndex,
                              input.icon
                            )
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
                  {/* Loop for each language */}
                  {languages.length > 0 &&
                    languages.map((singleLanguage: Language, langIndex) => {
                      const langId = singleLanguage.id;
                      const langCode = singleLanguage.code;

                      const benefitName =
                        input[`name_${langCode}` as keyof typeof input] || "";

                      return (
                        <TextField
                          key={`${benefitIndex}-${langId}`}
                          fullWidth
                          label={`Benefit ${benefitIndex + 1} (${
                            singleLanguage.name
                          })`}
                          value={benefitName}
                          onChange={(e) => {
                            const newInputs: any = [...benefitsInputs];
                            newInputs[benefitIndex][`name_${langCode}`] =
                              e.target.value;
                            setBenefitsInputs(newInputs);
                          }}
                          onBlur={async (e) => {
                            if (langCode === "en") {
                              const englishText = e.target.value;
                              if (!englishText.trim()) return;

                              for (const lang of languages) {
                                const targetLangId = lang?.id;
                                const targetLang = lang.code;
                                try {
                                  setTranslationLoading((prev) => ({
                                    ...prev,
                                    [`benefit_${targetLang}_${benefitIndex}`]:
                                      true,
                                  }));

                                  const translatedText =
                                    await handleTranslateText(
                                      targetLang,
                                      englishText
                                    );

                                  const newInputs: any = [...benefitsInputs];
                                  newInputs[benefitIndex][
                                    `name_${targetLang}`
                                  ] = translatedText || "";

                                  setFieldValue(
                                    `offerBasicInfo.locales.${targetLangId}.benefits`,
                                    newInputs
                                  );
                                } catch (err) {
                                  console.error(
                                    `Translation failed for ${targetLang}`,
                                    err
                                  );
                                } finally {
                                  setTranslationLoading((prev) => ({
                                    ...prev,
                                    [`benefit_${targetLang}_${benefitIndex}`]:
                                      false,
                                  }));
                                }
                              }
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {translationLoading[
                                  `benefit_${langCode}_${benefitIndex}`
                                ] && <CircularProgress size={20} />}
                              </InputAdornment>
                            ),
                          }}
                        />
                      );
                    })}
                </Box>

                {benefitIndex === 0 ? (
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
                          benefitsInputs.filter((_, i) => i !== benefitIndex)
                        );
                      }}
                    />
                  </IconButton>
                )}
              </Box>
            ))}
          </Grid>

          {/* Desktop image */}
          {languages.length > 0 &&
            languages.map((singleLanguage: Language, index) => {
              const langId = singleLanguage.id;
              const langCode = singleLanguage.code;
              return (
                <Grid item xs={12} key={index}>
                  <Typography variant="subtitle1" gutterBottom>
                    {`Desktop image (${singleLanguage.name})`}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      size="small"
                      sx={{ width: 150, height: 35 }}
                    >
                      {uploading.desktop?.[langId] ? (
                        <CircularProgress size={18} />
                      ) : values.offerBasicInfo.locales[langId]
                          ?.desktop_image ? (
                        "Change Image"
                      ) : (
                        "Upload Image"
                      )}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) =>
                          uploadImageToBucket(e, "desktop", langId)
                        }
                      />
                    </Button>

                    {/* Image Preview + Remove */}
                    {values.offerBasicInfo.locales[langId]?.desktop_image && (
                      <Box mt={1} display="flex" alignItems="center" gap={3}>
                        <img
                          src={
                            values.offerBasicInfo.locales[langId]?.desktop_image
                          }
                          alt={`Desktop ${singleLanguage.name} Image`}
                          style={{ width: 33, height: 33, borderRadius: 2 }}
                        />

                        <Button
                          variant="text"
                          color="error"
                          onClick={() =>
                            removeFileFromBucket(
                              values.offerBasicInfo.locales[langId]
                                ?.desktop_image,
                              "desktop",
                              langId
                            )
                          }
                        >
                          Remove
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}

          {/* Mobile image */}
          {languages.length > 0 &&
            languages.map((singleLanguage: Language, index) => {
              const langId = singleLanguage.id;
              const langCode = singleLanguage.code;

              return (
                <Grid item xs={12} key={index}>
                  <Typography variant="subtitle1" gutterBottom>
                    {`Mobile image (${singleLanguage.name})`}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      size="small"
                      sx={{ width: 150, height: 35 }}
                    >
                      {uploading.mobile?.[langId] ? (
                        <CircularProgress size={18} />
                      ) : values.offerBasicInfo.locales[langId]
                          ?.mobile_image ? (
                        "Change Image"
                      ) : (
                        "Upload Image"
                      )}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) =>
                          uploadImageToBucket(e, "mobile", langId)
                        }
                      />
                    </Button>

                    {/* Image Preview + Remove */}
                    {values.offerBasicInfo.locales[langId]?.mobile_image && (
                      <Box mt={1} display="flex" alignItems="center" gap={3}>
                        <img
                          src={
                            values.offerBasicInfo.locales[langId]?.mobile_image
                          }
                          alt={`Mobile ${singleLanguage.name} Image`}
                          style={{ width: 33, height: 33, borderRadius: 2 }}
                        />

                        <Button
                          variant="text"
                          color="error"
                          onClick={() =>
                            removeFileFromBucket(
                              values.offerBasicInfo.locales[langId]
                                ?.mobile_image,
                              "mobile",
                              langId
                            )
                          }
                        >
                          Remove
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}

          {/* Description */}
          {languages.length > 0 &&
            languages.map((singleLanguage: Language, index) => {
              const langId = singleLanguage.id;
              const langCode = singleLanguage.code;

              return (
                <Grid item xs={12} key={index}>
                  <Typography variant="subtitle1" gutterBottom>
                    {`Description (${singleLanguage.name})`}
                  </Typography>

                  <RichTextEditor
                    value={
                      values.offerBasicInfo.locales[langId]?.description || ""
                    }
                    setValue={(value: string) => {
                      setFieldValue(
                        `offerBasicInfo.locales.${langId}.description`,
                        value
                      );
                    }}
                    language={langCode}
                    onBlur={async () => {
                      if (langCode === "en") {
                        const englishText =
                          values.offerBasicInfo.locales[langId]?.description ||
                          "";
                        if (!englishText.trim()) return;

                        for (const lang of languages) {
                          const targetLang = lang.code;
                          const targetLangId = lang.id;

                          if (targetLang !== "en") {
                            try {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`description_${targetLang}`]: true,
                              }));

                              const translatedText = await handleTranslateText(
                                targetLang,
                                englishText
                              );

                              setFieldValue(
                                `offerBasicInfo.locales.${targetLangId}.description`,
                                translatedText
                              );
                            } catch (err) {
                              console.error(
                                `Translation failed for ${targetLang}`,
                                err
                              );
                            } finally {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`description_${targetLang}`]: false,
                              }));
                            }
                          }
                        }
                      }
                    }}
                    translationLoading={
                      translationLoading[`description_${langCode}`]
                    }
                  />
                </Grid>
              );
            })}

          {/* Terms And Conditions*/}
          {languages.length > 0 &&
            languages.map((singleLanguage: Language, index) => {
              const langId = singleLanguage.id;
              const langCode = singleLanguage.code;

              return (
                <Grid item xs={12} key={index}>
                  <Typography variant="subtitle1" gutterBottom>
                    {`Terms And Conditions  (${singleLanguage.name})`}
                  </Typography>

                  <RichTextEditor
                    value={
                      values.offerBasicInfo.locales[langId]
                        ?.term_and_condition || ""
                    }
                    setValue={(value: string) => {
                      setFieldValue(
                        `offerBasicInfo.locales.${langId}.term_and_condition`,
                        value
                      );
                    }}
                    language={langCode}
                    onBlur={async () => {
                      if (langCode === "en") {
                        const englishText =
                          values.offerBasicInfo.locales[langId]
                            ?.term_and_condition || "";
                        if (!englishText.trim()) return;

                        for (const lang of languages) {
                          const targetLang = lang.code;
                          const targetLangId = lang.id;

                          if (targetLang !== "en") {
                            try {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`term_and_condition_${targetLang}`]: true,
                              }));

                              const translatedText = await handleTranslateText(
                                targetLang,
                                englishText
                              );

                              setFieldValue(
                                `offerBasicInfo.locales.${targetLangId}.term_and_condition`,
                                translatedText
                              );
                            } catch (err) {
                              console.error(
                                `Translation failed for ${targetLang}`,
                                err
                              );
                            } finally {
                              setTranslationLoading((prev) => ({
                                ...prev,
                                [`term_and_condition_${targetLang}`]: false,
                              }));
                            }
                          }
                        }
                      }
                    }}
                    translationLoading={
                      translationLoading[`term_and_condition_${langCode}`]
                    }
                  />
                </Grid>
              );
            })}

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
