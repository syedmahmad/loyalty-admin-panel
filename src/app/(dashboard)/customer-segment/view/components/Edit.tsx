"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Tooltip,
  Stack,
  Paper,
  Autocomplete,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import { useParams, useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { GET, PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import SearchAutoSuggest from "@/components/columnSearch/SearchAutoSuggest";
import { BusinessUnit } from "@/app/(dashboard)/coupons/types";
import { LocalesState } from "@/types/campaign.type";
import { Language } from "@/types/language.type";
import { tenantService } from "@/services/tenantService";
import { openAIService } from "@/services/openAiService";
import { RichTextEditor } from "@/components/TextEditor";

const fetchSegment = async (id: any) => {
  const response = await GET(`/customer-segments/view-customers/${id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch segment");
  }
  return response.data;
};

const fetchAllCustomers = async (tenantId: number) => {
  const response = await GET(`/customers/${tenantId}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch customers");
  }
  return response.data;
};

const addCustomerToSegment = async (
  segmentId: number,
  customerId: number,
  userSecret: string
) => {
  return await PUT(
    `/customer-segments/add-customer/${segmentId}`,
    { customer_id: customerId },
    userSecret
  );
};

const removeCustomerFromSegment = async (
  segmentId: number,
  customerId: number,
  userSecret: string
) => {
  return await PUT(
    `/customer-segments/remove-customer/${segmentId}`,
    { customer_id: customerId },
    userSecret
  );
};

const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const response = await GET(`/business-units/${clientInfo.id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

const CustomerSegmentEditPage = ({
  segmentId,
  setSelectedSegmentId,
  onClose,
}: any) => {
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [segment, setSegment] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSecret, setUserSecret] = useState<string>("");
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [selectedBusinessUnitId, setSelectedBusinessUnitId] =
    useState<string>("");
  const [error, setError] = useState("");

  const [locales, setLocales] = useState<LocalesState>({});
  const [languages, setLanguages] = useState<Language[]>([]);
  const [segmentLocales, setSegmentLocales] = useState<any>([]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const clientInfo = localStorage.getItem("client-info");
  const parsed = JSON.parse(clientInfo!);
  const tenantId = parsed?.id || 1;

  /** States For Auto suggest dropdown Start */
  const [options, setOptions] = useState<{ label: string; id: number }[]>([]);
  const [selectedValues, setSelectedValues] = useState<
    { label: string; id: number }[]
  >([]);
  const [autoSuggestLoading, setAutoSuggestLoading] = useState(false);
  let debounceTimer: NodeJS.Timeout;
  /** States For Auto suggest dropdown End */

  useEffect(() => {
    const secret = localStorage.getItem("token");
    if (secret) setUserSecret(secret);
  }, []);

  useEffect(() => {
    if (!segmentId) return;
    setLoading(true);
    const fetchData = async () => {
      const segment = await fetchSegment(segmentId);
      const clientInfo = localStorage.getItem("client-info");
      const parsed = JSON.parse(clientInfo!);
      const tenantId = parsed?.id || 1;
      const allCustomers = await fetchAllCustomers(tenantId);
      setSegment(segment);

      const segmentLocales: any = {};
      segment.locales.forEach((locale: any) => {
        const langId = locale.language?.id;
        if (langId) {
          segmentLocales[langId] = {
            name: locale.name || "",
            description: locale.description || "",
          };
        }
      });

      setSegmentLocales(segment.locales);
      setLocales(segmentLocales);

      setName(segment.name);
      setNameAr(segment.name_ar);
      setDescription(segment.description);
      setDescriptionAr(segment.description_ar);
      setSelectedBusinessUnitId(segment.business_unit_id);
      setCustomers(allCustomers.data);
      setLoading(false);
    };
    fetchData();
  }, [segmentId]);

  const handleAddCustomer = async () => {
    console.log(!selectedCustomerIds.length, !segmentId, !userSecret);

    if (!selectedCustomerIds.length || !segmentId || !userSecret) {
      return;
    }

    try {
      // Add all selected customers to the segment
      await Promise.all(
        selectedCustomerIds.map((id) =>
          addCustomerToSegment(+segmentId, +id, userSecret)
        )
      );

      const updated = await fetchSegment(segmentId);
      setSegment(updated);
      setSelectedCustomerIds([]); // Reset selection
      setSelectedValues([]);
      toast.success("Customers added to segment");
    } catch (error) {
      toast.error("Failed to add customers to segment");
      console.error(error);
    }
  };

  const handleRemoveCustomer = async (customerId: number) => {
    if (!segmentId || !userSecret) return;
    await removeCustomerFromSegment(+segmentId, customerId, userSecret);
    const updated = await fetchSegment(segmentId);
    setSegment(updated);
    toast.success("Customer removed from segment");
  };

  const segmentCustomers = segment?.members?.map((m: any) => m.customer) || [];

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

  const handleSubmit = async () => {
    const allNamesValid =
      Object.keys(locales).length > 0 &&
      Object.values(locales).every(
        (locale) => (locale.name ?? "").trim() !== ""
      );

    if (!allNamesValid) {
      toast.error("Name is required");
      return;
    }
    
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
        business_unit_id: selectedBusinessUnitId,
        selected_customer_ids: selectedCustomerIds,
        locales: Object.entries(locales).map(([languageId, localization]) => ({
          id: segmentLocales.find((loc: any) => loc?.language.id === languageId)
            ?.id,
          languageId,
          name: localization.name,
          description: localization.description,
        })),
      };

      console.log("Creating customer segment with payload:", payload);

      const res = await PUT(`/customer-segments/${segmentId}`, payload);
      if (res?.status === 201 || res?.status === 200) {
        toast.success("Customer segment updated successfully!");
        setSelectedSegmentId(null);
        onClose();
      } else {
        setError("Failed to update customer segment");
      }
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <Drawer
        anchor="right"
        open={segmentId}
        onClose={() => {
          setSelectedSegmentId(null);
        }}
        PaperProps={{
          sx: { width: 400 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography fontSize="20px" fontWeight={600}>
            Edit Customer Segment
          </Typography>
          <IconButton
            edge="end"
            onClick={() => {
              setSelectedSegmentId(null);
              onClose();
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {loading || !segment ? (
          <Box mt={6} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <CardContent>
            <Grid container spacing={2}>
              {/* Segment Name */}
              {languages.length > 0 &&
                languages.map((singleLanguage: Language, index) => {
                  const langId = singleLanguage.id;
                  const langCode = singleLanguage.code;
                  const fieldName = `locales.${langId}.name`;

                  return (
                    <Grid item xs={12} key={index}>
                      <TextField
                        fullWidth
                        name={fieldName}
                        label={`Segment Name (${singleLanguage.name})`}
                        value={locales[langId]?.name || ""}
                        onChange={async (e) => {
                          const newValue = e.target.value;
                          setLocales((prev: any) => ({
                            ...prev,
                            [langId]: {
                              ...prev[langId],
                              name: newValue,
                            },
                          }));
                        }}
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
                                  setLocales((prev: any) => ({
                                    ...prev,
                                    [lang.id]: {
                                      ...prev[lang.id],
                                      name: translatedText,
                                    },
                                  }));
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
                        value={locales[langId]?.description || ""}
                        setValue={(value: string) => {
                          setLocales((prev: any) => ({
                            ...prev,
                            [langId]: {
                              ...(prev[langId] || {}),
                              description: value || "",
                            },
                          }));
                        }}
                        language={langCode}
                        onBlur={async () => {
                          if (langCode === "en") {
                            const englishText =
                              locales[langId]?.description || "";
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

                                  setLocales((prev: any) => ({
                                    ...prev,
                                    [targetLangId]: {
                                      ...(prev[targetLangId] || {}),
                                      description: translatedText || "",
                                    },
                                  }));
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

              {customers.filter(
                (c) => !segmentCustomers.some((sc: any) => sc.id === c.id)
              ).length > 0 ? (
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

              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  {/* Add Customer Button */}
                  <Button
                    variant="outlined"
                    onClick={() => handleAddCustomer()}
                    disabled={!selectedCustomerIds.length}
                  >
                    Add
                  </Button>

                  {/* Update customer segment Button */}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleSubmit}
                    // disabled={loading || submitted}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 550,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Update"}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {segmentCustomers.length ? (
              <Box sx={{ maxWidth: 500, mx: "auto", mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Segment Customers
                </Typography>
                <Stack spacing={2}>
                  {segmentCustomers.map((c: any) => (
                    <Paper
                      key={c.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {c.name}
                        </Typography>
                        {c.email && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              wordBreak: "break-word",
                              fontFamily: "monospace",
                              color: "text.secondary",
                            }}
                          >
                            {c.email}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        edge="end"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveCustomer(c.id)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </CardContent>
        )}
      </Drawer>
    </>
  );
};

export default CustomerSegmentEditPage;
