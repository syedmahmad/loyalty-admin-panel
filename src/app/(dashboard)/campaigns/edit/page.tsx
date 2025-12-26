"use client";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DateTime } from "luxon";
import React, { useEffect, useRef, useState } from "react";
import { GET, PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { RichTextEditor } from "@/components/TextEditor";
import CouponCard from "@/components/cards/CouponCard";
import { CAMPAIGN_TYPES } from "@/constants/constants";
import { LocalesState } from "@/types/campaign.type";
import { Language } from "@/types/language.type";
import { tenantService } from "@/services/tenantService";
import { openAIService } from "@/services/openAiService";

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
};

interface CampaignTypeOption {
  label: string;
  value: string;
}

const CampaignEdit = ({ onSuccess }: any) => {
  const router = useRouter();
  const params = useSearchParams();
  const paramId = params.get("id") || null;
  const theme = useTheme();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bus, setBus] = useState<number | null>(null);
  const [allBus, setAllBus] = useState<any[]>([]);
  const [rulesByType, setRulesByType] = useState<Record<string, any[]>>({});
  const [selectedRules, setSelectedRules] = useState<Record<string, number[]>>(
    {}
  );
  const [ruleTypes, setRuleTypes] = useState<string[]>([]);
  const [availableRuleTypes, setAvailableRuleTypes] = useState<string[]>([]);
  const [tiers, setTiers] = useState<
    { tier_id: number; point_conversion_rate?: number }[]
  >([]);
  const [allTiers, setAllTiers] = useState<any[]>([]);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allSegments, setAllSegments] = useState<any>([]);
  const [selectedSegments, setSelectedSegments] = useState<any>([]);
  const [selectedCampaignType, setSelectedCampaignType] =
    useState<CampaignTypeOption | null>(null);

  const [locales, setLocales] = useState<LocalesState>({});
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [campaignLocales, setCampaignLocales] = useState<any>([]);

  const ALL_RULE_TYPES = [
    "event based earn",
    "spend and earn",
    "burn",
    "dynamic rule",
  ];

  useEffect(() => {
    fetchInitialData();
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

  const fetchInitialData = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const [buRes, tierRes, rulesRes, couponsRes, campaignRes, segmentsRes] =
      await Promise.all([
        GET(`business-units/${clientInfo.id}`),
        GET(`tiers/${clientInfo.id}`),
        GET(`rules/${clientInfo.id}`),
        GET(`/coupons/${clientInfo.id}?limit=5`),
        GET(`/campaigns/single/${paramId}`),
        GET(`/customer-segments/${clientInfo.id}`),
      ]);

    const campaign = campaignRes?.data;
    const campaignLocales: any = {};
    campaign.locales.forEach((locale: any) => {
      const langId = locale.language?.id;
      if (langId) {
        campaignLocales[langId] = {
          name: locale.name || "",
          description: locale.description || "",
        };
      }
    });

    setCampaignLocales(campaign.locales);
    setLocales(campaignLocales);
    setName(campaign.name);
    setStartDate(DateTime.fromISO(campaign.start_date).toFormat("yyyy-MM-dd"));
    setEndDate(DateTime.fromISO(campaign.end_date).toFormat("yyyy-MM-dd"));
    setBus(campaign.business_unit_id);
    setDescription(campaign.description || "");

    const newSelectedSegments = campaign.customerSegments.map(
      (item: any) => item.segment
    );
    setAllSegments(segmentsRes?.data?.data || []);
    setSelectedSegments(newSelectedSegments || []);

    const coupon = campaign?.coupons.map((item: any) => item.coupon)[0];
    setSelectedCoupons(campaign?.coupons.map((item: any) => item.coupon));

    const campType: any = CAMPAIGN_TYPES.find(
      (singleCampaignType) =>
        singleCampaignType.value === campaign.campaign_type
    );
    setSelectedCampaignType(campType);

    setTiers(
      campaign.tiers.map((t: any) => ({
        tier_id: t.tier.id,
        point_conversion_rate: parseFloat(t.point_conversion_rate) || 1,
      }))
    );

    const grouped: Record<string, number[]> = {};
    campaign.rules.forEach((r: any) => {
      const type = r.rule.rule_type;
      const id = r.rule.id;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(id);
    });

    const usedTypes = Object.keys(grouped);
    const available = ALL_RULE_TYPES.filter((t) => !usedTypes.includes(t));
    setSelectedRules(grouped);
    setRuleTypes(usedTypes);
    // setRuleTypes((prev) => [""]);

    setAvailableRuleTypes(available);
    setAllCoupons(couponsRes?.data?.data || []);

    setAllBus(buRes?.data || []);
    setAllTiers(tierRes?.data?.tiers || []);

    const groupedRules = (rulesRes?.data?.rules || []).reduce(
      (acc: any, rule: any) => {
        acc[rule.rule_type] = acc[rule.rule_type] || [];
        acc[rule.rule_type].push(rule);
        return acc;
      },
      {}
    );
    setRulesByType(groupedRules);
  };

  const handleRuleToggle = (type: string, ruleId: number) => {
    const current = selectedRules[type] || [];
    if (current.includes(ruleId)) {
      setSelectedRules({
        ...selectedRules,
        [type]: current.filter((id) => id !== ruleId),
      });
    } else {
      setSelectedRules({ ...selectedRules, [type]: [...current, ruleId] });
    }
  };

  const handleRuleTypeAdd = () => {
    if (availableRuleTypes.length === 0) return;
    setRuleTypes((prev) => [...prev, ""]);
  };

  const handleRuleTypeChange = (index: number, newType: string) => {
    const oldType = ruleTypes[index];
    const updated = [...ruleTypes];
    updated[index] = newType;
    setRuleTypes(updated);

    setAvailableRuleTypes((prev) => {
      let updatedList = prev.filter((t) => t !== newType);
      if (oldType && oldType !== "" && !prev.includes(oldType)) {
        updatedList = [...updatedList, oldType];
      }
      return updatedList;
    });
  };

  const handleRuleTypeRemove = (index: number) => {
    const removedType = ruleTypes[index];
    const updated = [...ruleTypes];
    updated.splice(index, 1);
    setRuleTypes(updated);

    const updatedSelectedRules = { ...selectedRules };
    delete updatedSelectedRules[removedType];
    setSelectedRules(updatedSelectedRules);

    if (removedType && !availableRuleTypes.includes(removedType)) {
      setAvailableRuleTypes((prev) => [...prev, removedType]);
    }
  };

  const isTierSelected = (id: number) => tiers.some((t) => t.tier_id === id);

  const handleTierToggle = (tierId: number) => {
    if (isTierSelected(tierId)) {
      setTiers(tiers.filter((t) => t.tier_id !== tierId));
    } else {
      setTiers([...tiers, { tier_id: tierId, point_conversion_rate: 1 }]);
    }
  };

  const handleConversionRateChange = (tierId: number, value?: number) => {
    setTiers((prev) =>
      prev.map((t) =>
        t.tier_id === tierId ? { ...t, point_conversion_rate: value } : t
      )
    );
  };

  const handleSubmit = async () => {
    const allNamesValid =
      Object.keys(locales).length > 0 &&
      Object.values(locales).every(
        (locale) => (locale.name ?? "").trim() !== ""
      );

    if (!allNamesValid || !startDate || !endDate || !bus) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      selectedCampaignType?.value === "COUPONS" &&
      selectedCoupons.length === 0
    ) {
      toast.error("Please select coupon");
      return;
    }

    if (selectedCampaignType?.value === "POINTS") {
      const isValid =
        Object.keys(selectedRules).length > 0 &&
        Object.values(selectedRules).some(
          (arr) => Array.isArray(arr) && arr.length > 0
        );
      if (!isValid) {
        toast.error("Please select rule");
        return;
      }
    }

    for (const t of tiers) {
      const tierInfo = allTiers.find(
        (singleTier) => singleTier.id === t.tier_id
      );

      const rate = Number(t.point_conversion_rate);
      if (isNaN(rate)) {
        toast.error(
          `The point conversion rate for the ${tierInfo.name} tier is required.`
        );
        return;
      }

      if (rate < 0) {
        toast.error(
          `The point conversion rate for the ${tierInfo.name} tier cannot be negative`
        );
        return;
      }
    }

    const ruleIds: number[] = Object.values(selectedRules).flat();
    const rulesPayload = ruleIds.map((id) => ({ rule_id: id }));
    const tiersPayload = tiers.map((t) => ({
      tier_id: t.tier_id,
      point_conversion_rate: Number(t.point_conversion_rate),
    }));
    const couponsPayload = selectedCoupons.map((singleCpn: { id: number }) => ({
      coupon_id: singleCpn.id,
    }));

    const segmentIds = selectedSegments.map((seg: any) => seg.id);

    const payload = {
      name,
      start_date: startDate,
      end_date: endDate,
      business_unit_id: bus,
      rules: rulesPayload,
      tiers: tiersPayload,
      coupons: couponsPayload,
      description,
      customer_segment_ids: segmentIds,
      campaign_type: selectedCampaignType?.value,
      locales: Object.entries(locales).map(([languageId, localization]) => ({
        id: campaignLocales.find((loc: any) => loc?.language.id === languageId)
          ?.id,
        languageId,
        name: localization.name,
        description: localization.description,
      })),
    };

    setLoading(true);
    try {
      const res = await PUT(`/campaigns/${paramId}`, payload);
      if (res?.status === 200) {
        toast.success("Campaign updated!");
        // router.push('/campaigns/view');
        onSuccess();
      } else {
        toast.error("Update failed");
      }
    } catch (err: any) {
      console.error(err);
      if (!toast.isActive("update-campaigns-error")) {
        toast.error(
          err?.response?.data?.message ||
            "An error occurred while editing the rule",
          {
            toastId: "update-campaigns-error",
          }
        );
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons(searchTerm);
  }, [searchTerm]);

  const fetchCoupons = async (searchTerm: string) => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const couponsRes = await GET(
      `/coupons/${clientInfo.id}?name=${encodeURIComponent(searchTerm)}&limit=5`
    );
    if (couponsRes?.status !== 200) {
      throw new Error("Failed to fetch coupons");
    }
    setAllCoupons(couponsRes?.data?.coupons || []);
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

  return (
    <>
      {/* <Tooltip title="Go Back">
        <IconButton onClick={() => router.back()} sx={{ width: 120, color: theme.palette.primary.main }}>
          <ArrowBackIcon /> &nbsp; Go Back
        </IconButton>
      </Tooltip>
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        ✏️ Edit Campaign
      </Typography> */}

      <Grid container spacing={2}>
        {/* Campaign Name */}
        {languages.length > 0 &&
          languages.map((singleLanguage: Language, index) => {
            const langId = singleLanguage.id;
            const langCode = singleLanguage.code;
            const fieldName = `campaignBasicInfo.locales.${langId}.name`;

            return (
              <Grid item xs={12} key={index}>
                <TextField
                  fullWidth
                  name={fieldName}
                  label={`Campaign Name (${singleLanguage.name})`}
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

                            const translatedText = await handleTranslateText(
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
                  inputProps={{
                    dir: langCode === "ar" ? "rtl" : "ltr",
                  }}
                />
              </Grid>
            );
          })}

        <Grid item xs={6}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Business Unit</InputLabel>
            <Select
              value={bus || ""}
              onChange={(e) => setBus(e.target.value as number)}
              label="Business Unit"
            >
              {allBus.map((bu) => (
                <MenuItem key={bu.id} value={bu.id}>
                  {bu.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={allSegments}
            getOptionLabel={(option) => option?.name || ""}
            value={selectedSegments}
            onChange={(event, newValue) => setSelectedSegments(newValue)}
            filterSelectedOptions
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer Segments"
                placeholder="Select customer segments"
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            options={CAMPAIGN_TYPES}
            getOptionLabel={(option) => option.label}
            value={selectedCampaignType ?? null}
            onChange={(event, newValue) => setSelectedCampaignType(newValue)}
            isOptionEqualToValue={(option, value) =>
              option.value === value?.value
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Campaign Type"
                placeholder="Select campaign type"
                fullWidth
              />
            )}
          />
        </Grid>

        {selectedCampaignType?.value === "POINTS" && (
          <>
            {ruleTypes.map((type, idx) => (
              <Grid key={idx} item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <FormControl fullWidth>
                    <InputLabel>Rule Type</InputLabel>
                    <Select
                      value={type}
                      onChange={(e) =>
                        handleRuleTypeChange(idx, e.target.value)
                      }
                      label="Rule Type"
                    >
                      {[
                        type,
                        ...availableRuleTypes.filter((t) => t !== type),
                      ].map((rt) => (
                        <MenuItem key={rt} value={rt}>
                          {rt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRuleTypeRemove(idx)}
                  >
                    ➖
                  </Button>
                </Box>

                <FormGroup sx={{ mt: 1 }}>
                  <RadioGroup
                    value={selectedRules[type] || ""}
                    onChange={(e) =>
                      handleRuleToggle(type, Number(e.target.value))
                    }
                  >
                    {(rulesByType[type] || []).map((rule, index) => {
                      return (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={
                                  selectedRules[type]?.includes(rule.id) ||
                                  false
                                }
                                onChange={() => handleRuleToggle(type, rule.id)}
                              />
                            }
                            value={rule.id}
                            label={rule?.locales?.[0]?.name || ""}
                          />
                          {rule?.locales?.[0]?.description && (
                            <Typography variant="body1">
                              (
                              {htmlToPlainText(rule?.locales?.[0]?.description)}
                              )
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </RadioGroup>
                </FormGroup>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={handleRuleTypeAdd}
                disabled={availableRuleTypes.length === 0}
              >
                ➕ Add Rule Type
              </Button>
            </Grid>
          </>
        )}

        {/* Coupons */}
        {selectedCampaignType?.value === "COUPONS" && (
          <>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={allCoupons}
                getOptionLabel={(option) => option.coupon_title}
                value={selectedCoupons}
                onChange={(event, newValue: any) =>
                  setSelectedCoupons(newValue)
                }
                filterSelectedOptions
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
                loading={loading}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.coupon_title}
                  </li>
                )}
                onInputChange={(event, newInputValue) => {
                  if (event?.type !== "change") return;
                  setSearchTerm(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Coupons"
                    placeholder="Search Coupons..."
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? (
                            <CircularProgress color="inherit" size={18} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Show selected Coupons as a Card */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {selectedCoupons?.map((singleSelectedCoupon, index) => (
                  <Grid item xs={12} sm={3} md={4} key={index + 1}>
                    <CouponCard
                      couponData={singleSelectedCoupon}
                      selectedCoupons={selectedCoupons}
                      setSelectedCoupons={setSelectedCoupons}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Typography variant="subtitle1">Tiers</Typography>
          {/* <FormGroup>
            {allTiers.map((tier) => {
              const selected = isTierSelected(tier.id);
              const current = tiers.find((t) => t.tier_id === tier.id);

              return (
                <Box
                  key={tier.id}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selected}
                        onChange={() => handleTierToggle(tier.id)}
                      />
                    }
                    label={tier.name}
                  />
                  {selected && selectedCampaignType?.value === "POINTS" && (
                    <TextField
                      type="number"
                      label="Point Conversion Rate"
                      value={current?.point_conversion_rate ?? 1}
                      onChange={(e) =>
                        handleConversionRateChange(
                          tier.id,
                          Number(e.target.value)
                        )
                      }
                      size="small"
                      sx={{ ml: 2, width: 180 }}
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  )}
                </Box>
              );
            })}
          </FormGroup> */}

          <Grid container>
            {allTiers.map((tier, index) => {
              const selected = isTierSelected(tier.id);
              const current = tiers.find((t) => t.tier_id === tier.id);
              return (
                <React.Fragment key={index}>
                  <Grid item xs={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selected}
                          onChange={() => handleTierToggle(tier.id)}
                        />
                      }
                      sx={{ mb: 2 }}
                      label={tier?.locales?.[0]?.name || ""}
                    />
                  </Grid>

                  <Grid item xs={8}>
                    {selected && selectedCampaignType?.value === "POINTS" && (
                      <TextField
                        fullWidth
                        type="number"
                        label="Point Conversion Rate"
                        value={current?.point_conversion_rate ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleConversionRateChange(
                            tier.id,
                            val === "" ? undefined : Number(val)
                          );
                        }}
                        sx={{ mb: 2 }}
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    )}
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
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
                      const englishText = locales[langId]?.description || "";
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
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          {loading ? <CircularProgress size={24} /> : "Update Campaign"}
        </Button>
      </Box>
    </>
  );
};

export default CampaignEdit;
