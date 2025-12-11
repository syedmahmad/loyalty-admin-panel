"use client";

import { RichTextEditor } from "@/components/TextEditor";
import { DELETE, GET, POST, PUT } from "@/utils/AxiosUtility";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
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
import { DateTime } from "luxon";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { BusinessUnit, OfferFormValues } from "../types";
import { STATION_TYPES } from "@/constants/constants";
import { tenantService } from "@/services/tenantService";
import { Language } from "@/types/language.type";
import { openAIService } from "@/services/openAiService";
import { UploadingState } from "@/types/offer.type";
import { getFileSizeFromUrl, getImageNameFromUrl } from "@/utils/Index";
import ImagePreviewDialog from "@/components/dialogs/ImagePreviewDialog";

type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
};

const EditOfferForm = ({ onSuccess, handleDrawerWidth }: any) => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string>(paramId || "");
  const [offerData, setOfferData] = useState<any>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [segments, setSegments] = useState([]);
  const [removing, setRemoving] = useState(false);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [languages, setLanguages] = useState<Language[]>([]);
  const [offerLocales, setOfferLocales] = useState<any>([]);

  /** multiple benefits with icon */
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

  /** image preview  */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({
    url: "",
    width: 0,
    height: 0,
    size: "", // optional
    fileName: "",
  });

  const fetchCustomerSegments = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(`/customer-segments/${clientInfo.id}`);
    setSegments(res?.data.data || []);
  };

  const userId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  useEffect(() => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const resolveAllPromises = async () => {
      const fetchTiersAndBUs = async (name: string = "") => {
        const [buRes] = await Promise.all([
          GET(
            `/business-units/${clientInfo.id}?name=${encodeURIComponent(name)}`
          ),
        ]);
        setBusinessUnits(buRes?.data || []);
        fetchCustomerSegments();

        if (paramId) {
          await fetchOfferById(paramId);
        }

        setInitializing(false);
      };

      await Promise.all([fetchTiersAndBUs()]);
    };
    resolveAllPromises();

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
  }, [paramId]);

  const fetchOfferById = async (id: string) => {
    setLoading(true);
    const res = await GET(`/offers/edit/${id}`);
    if (!res?.data) {
      toast.error("Offer not found");
      return;
    }

    const offerLocales: any = {};
    let benefitFromLocale: any = [{ name_en: "", name_ar: "", icon: "" }];
    res.data.locales.forEach((locale: any) => {
      const langId = locale.language?.id;
      if (langId) {
        offerLocales[langId] = {
          title: locale.title || "",
          subtitle: locale.subtitle || "",
          description: locale.description || "",
          term_and_condition: locale.term_and_condition || "",
          desktop_image: locale.desktop_image || "",
          mobile_image: locale.mobile_image || "",
          benefits: locale.benefits || [],
        };
      }
      if (locale?.benefits?.length) {
        benefitFromLocale = locale?.benefits;
      }
    });

    setSelectedId(id);
    setOfferData({ ...res.data, offerBasicInfo: { localesObj: offerLocales } });
    setBenefitsInputs(benefitFromLocale);
    setOfferLocales(res?.data?.locales);
    setImages(res?.data?.images);
    setLoading(false);
  };

  const formik = useFormik<OfferFormValues>({
    initialValues: {
      station_type: offerData?.station_type || "",
      business_unit_ids: offerData?.business_unit_id
        ? [offerData.business_unit_id]
        : [],
      benefits: "",
      date_from:
        DateTime.fromISO(offerData?.date_from).toFormat("yyyy-MM-dd") || "",
      date_to:
        DateTime.fromISO(offerData?.date_to).toFormat("yyyy-MM-dd") || "",
      status: offerData?.status,
      customer_segment_ids:
        offerData?.customerSegments.map((ls: any) => ls.segment.id) || [],
      all_users: offerData?.all_users,
      offerBasicInfo: { locales: { ...offerData?.offerBasicInfo?.localesObj } },
      show_in_app: offerData?.show_in_app,
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
      status: Yup.boolean().required(),
    }),
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSubmit(values);
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
  } = formik;

  const handleSubmit = async (values: OfferFormValues) => {
    const payloads = values.business_unit_ids.map((buId: number) => ({
      business_unit_id: buId,
      date_from: values.date_from,
      date_to: values.date_to,
      status: values.status,
      updated_by: userId,
      tenant_id: userId,
      created_by: userId,
      customer_segment_ids: values.customer_segment_ids,
      all_users: values.all_users,
      images: images,
      station_type: values.station_type,
      locales: Object.entries(values.offerBasicInfo.locales).map(
        ([languageId, localization]) => ({
          id: offerLocales.find((loc: any) => loc?.language.id === languageId)
            ?.id,
          languageId,
          title: localization.title,
          subtitle: localization.subtitle,
          description: localization.description,
          term_and_condition: localization.term_and_condition,
          desktop_image: localization.desktop_image,
          mobile_image: localization.mobile_image,
          // benefits: localization.benefits, 
          benefits: benefitsInputs,
        })
      ),
      show_in_app: values.show_in_app,
    }));

    const responses = await Promise.all(
      payloads.map(async (payload) => {
        if (payload.business_unit_id === offerData.business_unit_id) {
          const res = await PUT(`/offers/${selectedId}`, payload);
          return { success: true, status: res?.status };
        } else {
          const res = await POST(`/offers`, payload);
          return { success: true, status: res?.status };
        }
      })
    );

    const anyFailed = !responses.some(
      (res) => res.status === 201 || res.status === 200
    );

    if (anyFailed) {
      setLoading(false);
      toast.error("failed to update offer");
    } else {
      toast.success("offer updated successfully!");
      setLoading(false);
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

  const addBenefitInput = () => {
    setBenefitsInputs([
      ...benefitsInputs,
      { name_en: "", name_ar: "", icon: "" },
    ]);
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
      setTranslationLoading((prev) => ({ ...prev, [targetLang]: true }));

      const payload = {
        text: englishText,
        targetLanguage: [targetLang],
        sourceLanguage: "en",
      };

      const response = await openAIService.translateText(payload);
      return response.translatedText?.[targetLang] || "";
    } catch (error) {
      console.error(`Translation failed for ${targetLang}:`, error);
      return "";
    } finally {
      setTranslationLoading((prev) => ({ ...prev, [targetLang]: false }));
    }
  };

  const handlePreviewImage = async (imageUrl: string) => {
    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;

    const size = await getFileSizeFromUrl(imageUrl);
    const fileName = getImageNameFromUrl(imageUrl);

    try {
      await img.decode(); // waits even if image is cached
      setPreviewData({
        url: imageUrl,
        width: img.width,
        height: img.height,
        size,
        fileName,
      });

      setPreviewOpen(true);
    } catch (err) {
      console.error("Error decoding image", err);
    }
  };

  return (
    <>
      {offerData && (
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

                                const translatedText =
                                  await handleTranslateText(
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
                      inputProps={{
                        dir: langCode === "ar" ? "rtl" : "ltr",
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
                          ? String(
                              errors.offerBasicInfo.locales[langId].subtitle
                            )
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

                                const translatedText =
                                  await handleTranslateText(
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
                      inputProps={{
                        dir: langCode === "ar" ? "rtl" : "ltr",
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
                error={
                  !!touched.business_unit_ids && !!errors.business_unit_ids
                }
                helperText={
                  touched.business_unit_ids && errors.business_unit_ids
                }
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
                  <MenuItem
                    key={singleStation.value}
                    value={singleStation.value}
                  >
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
                  <Typography variant="subtitle1">
                    Apply to all users
                  </Typography>
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
                  options={segments.filter(
                    (s: any) => !values.customer_segment_ids.includes(s.id)
                  )}
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
                          onChange={(e) => handleFileChange(e, benefitIndex)}
                        />
                      </Button>
                      {input.icon && (
                        <Box display="flex" alignItems="center" gap={3}>
                          {/* <img
                            src={input.icon}
                            alt="Benefit Icon"
                            style={{
                              width: 33,
                              height: 33,
                              borderRadius: 2,
                            }}
                          /> */}

                          <Box
                            component="img"
                            src={input.icon}
                            alt="Benefit Icon"
                            onClick={() => handlePreviewImage(input.icon)}
                            sx={{
                              width: 33,
                              height: 33,
                              borderRadius: 0,
                              cursor: "pointer",
                              transition: "0.2s",
                              "&:hover": {
                                opacity: 0.8,
                                transform: "scale(1.05)",
                              },
                            }}
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
                                  if (targetLang !== "en") {
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

                                      const newInputs: any = [
                                        ...benefitsInputs,
                                      ];
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
                            inputProps={{
                              dir: langCode === "ar" ? "rtl" : "ltr",
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
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box
                            component="img"
                            src={
                              values.offerBasicInfo.locales[langId]
                                ?.desktop_image
                            }
                            alt={`Desktop ${singleLanguage.name} Image`}
                            onClick={() =>
                              handlePreviewImage(
                                values.offerBasicInfo.locales[langId]
                                  ?.desktop_image
                              )
                            }
                            sx={{
                              width: 33,
                              height: 33,
                              borderRadius: 0,
                              cursor: "pointer",
                              transition: "0.2s",
                              "&:hover": {
                                opacity: 0.8,
                                transform: "scale(1.05)",
                              },
                            }}
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
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box
                            component="img"
                            src={
                              values.offerBasicInfo.locales[langId]
                                ?.mobile_image
                            }
                            alt={`Mobile ${singleLanguage.name} Image`}
                            onClick={() =>
                              handlePreviewImage(
                                values.offerBasicInfo.locales[langId]
                                  ?.mobile_image
                              )
                            }
                            sx={{
                              width: 33,
                              height: 33,
                              borderRadius: 0,
                              cursor: "pointer",
                              transition: "0.2s",
                              "&:hover": {
                                opacity: 0.8,
                                transform: "scale(1.05)",
                              },
                            }}
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
                            values.offerBasicInfo.locales[langId]
                              ?.description || "";
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

                                const translatedText =
                                  await handleTranslateText(
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

                                const translatedText =
                                  await handleTranslateText(
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
                  type="submit"
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Update Offer"}
                </Button>
              </Box>

              <br />
              <br />
            </Grid>
          </Grid>

          <ImagePreviewDialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            url={previewData.url}
            width={previewData.width}
            height={previewData.height}
            size={previewData.size}
            fileName={previewData.fileName}
          />
        </form>
      )}
    </>
  );
};

export default EditOfferForm;
