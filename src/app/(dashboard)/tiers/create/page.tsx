"use client";

import { RichTextEditor } from "@/components/TextEditor";
import { businessUnitService } from "@/services/businessUnitService";
import { openAIService } from "@/services/openAiService";
import { tenantService } from "@/services/tenantService";
import { BusinessUnit } from "@/types/businessunit.type";
import { Language } from "@/types/language.type";
import { Benefit, TierBenefit, TierFormValues } from "@/types/tier.type";
import { POST } from "@/utils/AxiosUtility";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

const CreateTierForm = ({ onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [benefitsInputs, setBenefitsInputs] = useState<TierBenefit[]>([
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
        businessUnitService.getBusinessUnit(),
      ]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const addBenefitInput = () => {
    setBenefitsInputs([
      ...benefitsInputs,
      { name_en: "", name_ar: "", icon: "" },
    ]);
  };

  const initialValues: TierFormValues = {
    tierBasicInfo: { locales: {} },
    min_points: "",
    benefits: "",
    description: "",
    business_unit_ids: [] as number[],
  };

  const validationSchema = Yup.object({
    tierBasicInfo: Yup.object().shape({
      locales: Yup.object().shape(
        Object.fromEntries(
          languages.map((lang) => [
            lang.id,
            Yup.object().shape({
              name: Yup.string().required(
                `Tier name (${lang.name}) is required`
              ),
            }),
          ])
        )
      ),
    }),
    min_points: Yup.number().required("Minimum points required"),
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
      min_points: +values.min_points,
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
      locales: Object.entries(values.tierBasicInfo.locales).map(
        ([languageId, localization]) => ({
          languageId,
          name: localization.name,
          description: localization.description,
          benefits: localization.benefits,
        })
      ),
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
      setLoading(false);
      onSuccess();
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
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
      >
        {({ values, errors, touched, handleChange, setFieldValue }) => {
          return (
            <Form noValidate>
              <Grid container spacing={2}>
                {/* Tier Name */}
                {languages.length > 0 &&
                  languages.map((singleLanguage: Language, index) => {
                    const langId = singleLanguage.id;
                    const langCode = singleLanguage.code;
                    const fieldName = `tierBasicInfo.locales.${langId}.name`;

                    return (
                      <Grid item xs={12} key={index}>
                        <TextField
                          fullWidth
                          name={fieldName}
                          label={`Tier Name (${singleLanguage.name})`}
                          value={
                            values.tierBasicInfo.locales[langId]?.name || ""
                          }
                          onChange={handleChange}
                          error={Boolean(
                            errors.tierBasicInfo?.locales?.[langId]?.name
                          )}
                          helperText={
                            errors.tierBasicInfo?.locales?.[langId]?.name
                              ? String(
                                  errors.tierBasicInfo.locales[langId].name
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
                                      [`name_${targetLang}`]: true,
                                    }));

                                    const translatedText =
                                      await handleTranslateText(
                                        targetLang,
                                        englishText
                                      );
                                    setFieldValue(
                                      `tierBasicInfo.locales.${targetLangId}.name`,
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
                                      [`name_${targetLang}`]: false,
                                    }));
                                  }
                                }
                              }
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {translationLoading[`name_${langCode}`] && (
                                  <CircularProgress size={20} />
                                )}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    );
                  })}

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
                  {benefitsInputs.map((input, benefitIndex) => (
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      gap={1}
                      key={benefitIndex}
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
                        {/* Upload Icon */}
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
                              onChange={(e) =>
                                handleFileChange(e, benefitIndex)
                              }
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

                        {/* Loop for each language */}
                        {languages.length > 0 &&
                          languages.map(
                            (singleLanguage: Language, langIndex) => {
                              const langId = singleLanguage.id;
                              const langCode = singleLanguage.code;
                              const benefitName =
                                input[
                                  `name_${langCode}` as keyof typeof input
                                ] || "";

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
                                    newInputs[benefitIndex][
                                      `name_${langCode}`
                                    ] = e.target.value;
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

                                          const newInputs: any = [
                                            ...benefitsInputs,
                                          ];
                                          newInputs[benefitIndex][
                                            `name_${targetLang}`
                                          ] = translatedText || "";

                                          setFieldValue(
                                            `tierBasicInfo.locales.${targetLangId}.benefits`,
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
                            }
                          )}
                      </Box>

                      {/* Add / Delete Buttons */}
                      {benefitIndex === 0 ? (
                        <IconButton onClick={addBenefitInput}>
                          <AddIcon fontSize="small" color="primary" />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => {
                            setBenefitsInputs(
                              benefitsInputs.filter(
                                (_, i) => i !== benefitIndex
                              )
                            );
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Grid>

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
                            values.tierBasicInfo.locales[langId]?.description ||
                            ""
                          }
                          setValue={(value: string) => {
                            setFieldValue(
                              `tierBasicInfo.locales.${langId}.description`,
                              value
                            );
                          }}
                          language={langCode}
                          onBlur={async () => {
                            if (langCode === "en") {
                              const englishText =
                                values.tierBasicInfo.locales[langId]
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
                                      `tierBasicInfo.locales.${targetLangId}.description`,
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
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default CreateTierForm;
