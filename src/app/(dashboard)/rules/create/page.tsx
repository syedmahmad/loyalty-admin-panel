"use client";

import {
  Box,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Tooltip,
  IconButton,
  InputLabel,
  useTheme,
  InputAdornment,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { ChangeEvent, useEffect, useState } from "react";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/TextEditor";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  BURN_TYPES,
  FREQUENCY,
  REWARD_CONDITIONS,
  tooltipMessagesValidityAfterAssignmentForRule,
} from "@/constants/constants";
import slugify from "slugify";
import { log } from "node:console";
import ConditionTypeDropdown from "@/components/third-party/ConditionTypeInput";
import { BusinessUnit } from "../../coupons/types";
import { businessUnitService } from "@/services/businessUnitService";
import { tenantService } from "@/services/tenantService";
import { Language } from "@/types/language.type";
import { openAIService } from "@/services/openAiService";
import { FormType } from "@/types/rule.type";

const InfoLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Box display="flex" alignItems="center" mb={0.5}>
    <InputLabel sx={{ mr: 0.5 }}>{label}</InputLabel>
    <Tooltip title={tooltip} placement="top" arrow>
      <IconButton size="small" sx={{ p: 0.25 }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

const RuleCreateForm = ({ onSuccess }: any) => {
  const initialForm: FormType = {
    ruleBasicInfo: {
      locales: {},
    },
    rule_type: "event based earn",
    reward_condition: "minimum",
    min_amount_spent: "",
    reward_points: "",
    event_triggerer: "",
    max_redeemption_points_limit: "",
    points_conversion_factor: "",
    max_burn_percent_on_invoice: "",
    condition_type: "",
    condition_operator: "",
    condition_value: "",
    validity_after_assignment: 0,
    frequency: "once",
    conditions: [
      { condition_type: "", condition_operator: "", condition_value: "" },
    ],
    is_priority: 0,
    business_unit_id: "",
  };
  const theme = useTheme();
  const userInfo = JSON.parse(localStorage.getItem("client-info") || "{}");
  const created_by = userInfo?.id;
  const [form, setForm] = useState(initialForm);
  const [description, setDescription] = useState<string>("");
  const [descriptionAr, setDescriptionAr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [allTiers, setAllTiers] = useState<any[]>([]);
  const [tiers, setTiers] = useState<
    { tier_id: number; point_conversion_rate?: number }[]
  >([]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const [languages, setLanguages] = useState<Language[]>([]);
  const handleChange = (
    eOrName:
      | string
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    maybeValue?: any
  ) => {
    let name: string;
    let value: any;

    // Case 1: handleChange("business_unit_id", value)
    if (typeof eOrName === "string") {
      name = eOrName;
      value = maybeValue;
    }
    // Case 2: handleChange(event)
    else {
      name = eOrName.target.name;
      value = eOrName.target.value;
    }

    setForm((prev) => {
      const updatedForm = { ...prev };

      // Split nested names (like "ruleBasicInfo.locales.en.name")
      const keys = name.split(".");

      let current: any = updatedForm;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;

      return updatedForm;
    });
  };

  const handleSubmit = async () => {
    const allNamesValid = Object.values(form.ruleBasicInfo.locales).every(
      (locale) => locale.name && locale.name.trim() !== ""
    );

    if (!allNamesValid || !form.rule_type || !form.business_unit_id) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      (form.rule_type === "event based earn" &&
        (!form.event_triggerer || !form.reward_points)) ||
      (form.rule_type === "spend and earn" &&
        (!form.min_amount_spent || !form.reward_points)) ||
      (form.rule_type === "burn" &&
        (!form.min_amount_spent || !form.max_redeemption_points_limit))
      // ||
      // (selectedBurnType?.value === "FIXED" &&
      //   !form.points_conversion_factor) ||
      // (selectedBurnType?.value === "PERCENTAGE" &&
      //   !form.max_burn_percent_on_invoice)
    ) {
      toast.error("Please fill all required fields for this rule type");
      return;
    }

    setLoading(true);

    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);

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

    // const burnType = form.rule_type === "burn" ? selectedBurnType?.value : null;
    const tiersPayload = tiers.map((t) => ({
      tier_id: t.tier_id,
      point_conversion_rate: Number(t.point_conversion_rate) || 1,
    }));

    const payload = {
      // slug: slugify(form.name, {
      //   replacement: "_",
      //   lower: true,
      // }),
      slug: null,
      rule_type: form.rule_type,
      client_id: clientInfo.id,
      reward_condition: form.reward_condition,
      min_amount_spent: form.min_amount_spent
        ? parseFloat(form.min_amount_spent)
        : null,
      reward_points: form.reward_points ? parseFloat(form.reward_points) : null,
      event_triggerer: form.event_triggerer || null,
      max_redeemption_points_limit: form.max_redeemption_points_limit
        ? parseInt(form.max_redeemption_points_limit)
        : null,
      points_conversion_factor: form.points_conversion_factor
        ? parseFloat(form.points_conversion_factor)
        : null,
      max_burn_percent_on_invoice: form.max_burn_percent_on_invoice
        ? parseFloat(form.max_burn_percent_on_invoice)
        : null,
      condition_type: form.condition_type || null,
      condition_operator: form.condition_operator || null,
      condition_value: form.condition_value || null,
      validity_after_assignment:
        form.validity_after_assignment === 0
          ? undefined
          : form.validity_after_assignment,
      frequency: form.frequency || "once",
      tiers: tiersPayload,
      description,
      description_ar: descriptionAr,
      created_by,
      // burn_type: burnType,
      dynamic_conditions: ["dynamic rule", "burn"].includes(form.rule_type)
        ? form.conditions
        : null,
      is_priority: form.is_priority ? 1 : 0,
      business_unit_id: form.business_unit_id,

      locales: Object.entries(form.ruleBasicInfo.locales).map(
        ([languageId, localization]) => ({
          languageId,
          name: localization.name,
          description: localization.description,
        })
      ),
    };

    const response = await POST("/rules", payload);

    if (response?.status === 201) {
      toast.success("Rule created successfully!");
      setForm(initialForm);
      setDescription("");
      setDescriptionAr("");
      onSuccess();
    } else {
      toast.error("Failed to create rule");
    }

    setLoading(false);
  };

  const handleConditionTypeDropdownChange = (
    index: number,
    newValue: string
  ) => {
    const updated = [...form.conditions];
    updated[index].condition_type = newValue;
    handleChange("conditions", updated);
  };

  const fetchBusinessUnitInfo = async () => {
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

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
        const response = await GET(
          `/tiers/${clientInfo.id}?bu=${form.business_unit_id}`
        );
        if (response?.status === 200) {
          setAllTiers(response.data.tiers || []);
        } else {
          toast.error("Failed to fetch tiers");
        }
      } catch (error) {
        toast.error("An error occurred while fetching tiers");
      }
    };

    if (form.business_unit_id) {
      fetchTiers();
    }
  }, [form.business_unit_id]);

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
      <Grid container spacing={2}>
        {languages.length > 0 &&
          languages.map((singleLanguage: Language, index) => {
            const langId = singleLanguage.id;
            const langCode = singleLanguage.code;
            const fieldName = `ruleBasicInfo.locales.${langId}.name`;

            return (
              <Grid item xs={12} key={index}>
                <TextField
                  fullWidth
                  name={fieldName}
                  label={`Rule Name (${singleLanguage.name})`}
                  value={form.ruleBasicInfo.locales[langId]?.name || ""}
                  onChange={handleChange}
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

                            setForm((prev) => ({
                              ...prev,
                              ruleBasicInfo: {
                                ...prev.ruleBasicInfo,
                                locales: {
                                  ...prev.ruleBasicInfo.locales,
                                  [targetLangId]: {
                                    ...(prev.ruleBasicInfo.locales[
                                      targetLangId
                                    ] || {}),
                                    name: translatedText || "",
                                  },
                                },
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

        {/* Business Unit */}
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            name="business_unit_id"
            label="Business Unit"
            SelectProps={{ multiple: false }}
            value={form.business_unit_id}
            onChange={(e) => handleChange("business_unit_id", e.target.value)}
          >
            {businessUnits.map((bu) => (
              <MenuItem key={bu.id} value={bu.id}>
                {bu.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Rule Type */}
        <Grid item xs={12}>
          <InfoLabel
            label="Rule Type"
            tooltip="Choose the rule logic to apply."
          />
          <TextField
            select
            fullWidth
            value={form.rule_type}
            onChange={(e) => handleChange("rule_type", e.target.value)}
          >
            <MenuItem value="event based earn">Event-Based Earn</MenuItem>
            <MenuItem value="spend and earn">Spend & Earn</MenuItem>
            <MenuItem value="burn">Burn</MenuItem>
            <MenuItem value="dynamic rule">Dynamic Rule</MenuItem>
          </TextField>
        </Grid>

        {/* Event Triggerer */}
        {form.rule_type === "event based earn" && (
          <Grid item xs={12}>
            <InfoLabel
              label="Event Triggerer"
              tooltip="Triggering event like signup or birthday."
            />
            <TextField
              fullWidth
              value={form.event_triggerer}
              onChange={(e) => handleChange("event_triggerer", e.target.value)}
              placeholder="e.g. signup, birthday"
            />
          </Grid>
        )}

        {["dynamic rule", "burn"].includes(form.rule_type) &&
          form.conditions?.map((eachCondition, index) => (
            <Grid item xs={12} key={index}>
              <Box display="flex" gap={1} alignItems={"center"}>
                {/* Condition Type */}
                {/* <TextField
                  select
                  label={`Condition Type ${eachCondition.condition_type}`}
                  fullWidth
                  value={eachCondition.condition_type}
                  onChange={(e) => {
                    console.log(
                      "Condition Type Changed",
                      form.conditions,
                      e.target.value
                    );
                    const updated = [...form.conditions];
                    updated[index].condition_type = e.target.value;
                    handleChange("conditions", updated);
                  }}
                >
                  <MenuItem value="station_id">Station ID</MenuItem>
                  <MenuItem value="fuel_type">Fuel Type</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                </TextField> */}

                <ConditionTypeDropdown
                  preFilledvalue={eachCondition.condition_type}
                  handleConditionTypeDropdownChange={(val) =>
                    handleConditionTypeDropdownChange(index, val)
                  }
                />

                {/* Condition Operator */}
                <TextField
                  select
                  fullWidth
                  label="Condition Operator"
                  value={eachCondition.condition_operator}
                  onChange={(e) => {
                    const updated = [...form.conditions];
                    updated[index].condition_operator = e.target.value;
                    handleChange("conditions", updated);
                  }}
                >
                  <MenuItem value="==">Equal To (==)</MenuItem>
                  <MenuItem value="!=">Not Equal (!=)</MenuItem>
                  <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                  <MenuItem value=">=">Greater Than or Equal (&gt;=)</MenuItem>
                  <MenuItem value="<">Less Than (&lt;)</MenuItem>
                  <MenuItem value="<=">Less Than or Equal (&lt;=)</MenuItem>
                </TextField>

                {/* Value */}
                <TextField
                  label="Value"
                  fullWidth
                  value={eachCondition.condition_value}
                  onChange={(e) => {
                    const updated = [...form.conditions];
                    updated[index].condition_value = e.target.value;
                    handleChange("conditions", updated);
                  }}
                />

                {/* Add and Remove buttons */}
                {index === 0 ? (
                  <IconButton
                    onClick={() => {
                      const updated = [
                        ...(form.conditions || []),
                        {
                          condition_type: "",
                          condition_operator: "",
                          condition_value: "",
                        },
                      ];
                      handleChange("conditions", updated);
                    }}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => {
                      const updated = form.conditions.filter(
                        (_, i) => i !== index
                      );
                      handleChange("conditions", updated);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>
          ))}

        {/* REWARD_CONDITIONS */}
        {(form.rule_type === "spend and earn" ||
          form.rule_type === "dynamic rule") && (
          <Grid item xs={12}>
            <InfoLabel
              label="Reward Condition"
              tooltip={
                "Per Amount Spent: Points are given for every set amount spent (e.g., 5 points for every ₹10).\n" +
                "Minimum Spend: Points are given only once when the customer spends at least the minimum amount."
              }
            />
            <TextField
              select
              fullWidth
              value={form.reward_condition}
              onChange={(e) => handleChange("reward_condition", e.target.value)}
            >
              {REWARD_CONDITIONS.map((condition) => (
                <MenuItem key={condition.value} value={condition.value}>
                  {condition.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {(form.rule_type === "spend and earn" ||
          form.rule_type === "burn" ||
          form.rule_type === "dynamic rule") && (
          <Grid item xs={12}>
            <InfoLabel
              label={`${
                form.reward_condition === "minimum" ? "Minimum" : "Per"
              } Amount Spent`}
              tooltip={`${
                form.reward_condition === "minimum" ? "Minimum" : "Per"
              } spend amount to activate the rule.`}
            />
            <TextField
              fullWidth
              type="number"
              value={form.min_amount_spent}
              onChange={(e) => handleChange("min_amount_spent", e.target.value)}
            />
          </Grid>
        )}

        {/* {form.rule_type === "dynamic rule" && (
          <Grid item xs={12}>
            <Box display="flex" gap={1}>
              <TextField
                label="Condition Type"
                fullWidth
                value={form.condition_type}
                onChange={(e) => handleChange("condition_type", e.target.value)}
              />
              <TextField
                select
                fullWidth
                label="Condition Operator"
                value={form.condition_operator}
                onChange={(e) =>
                  handleChange("condition_operator", e.target.value)
                }
              >
                <MenuItem value="==">Equal To (==)</MenuItem>
                <MenuItem value="!=">Not Equal (!=)</MenuItem>
                <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                <MenuItem value=">=">Greater Than or Equal (&gt;=)</MenuItem>
                <MenuItem value="<">Less Than (&lt;)</MenuItem>
                <MenuItem value="<=">Less Than or Equal (&lt;=)</MenuItem>
              </TextField>
              <TextField
                label="Value"
                fullWidth
                value={form.condition_value}
                onChange={(e) =>
                  handleChange("condition_value", e.target.value)
                }
              />
            </Box>
          </Grid>
        )} */}

        {(form.rule_type === "event based earn" ||
          form.rule_type === "spend and earn" ||
          form.rule_type === "dynamic rule") && (
          <Grid item xs={12}>
            <InfoLabel
              label="Reward Points"
              tooltip="Number of points to be awarded."
            />
            <TextField
              fullWidth
              type="number"
              value={form.reward_points}
              onChange={(e) => handleChange("reward_points", e.target.value)}
            />
          </Grid>
        )}

        {form.rule_type === "burn" && (
          <>
            {/* <Grid item xs={12}>
              <Autocomplete
                options={BURN_TYPES}
                getOptionLabel={(option) => option.label}
                value={selectedBurnType}
                onChange={(event, newValue) => setSelectedBurnType(newValue)}
                isOptionEqualToValue={(option, value) =>
                  option.value === value?.value
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Burn Type"
                    placeholder="Select burn type"
                    fullWidth
                  />
                )}
              />
            </Grid> */}

            <Grid item xs={12}>
              <InfoLabel
                label="Max Redeemable Points in single transaction"
                tooltip="Max points a user can burn in a transaction."
              />
              <TextField
                fullWidth
                type="number"
                value={form.max_redeemption_points_limit}
                onChange={(e) =>
                  handleChange("max_redeemption_points_limit", e.target.value)
                }
              />
            </Grid>

            {/* {selectedBurnType?.value === "FIXED" && ( */}
            <Grid item xs={12}>
              <InfoLabel
                label="Points Conversion Factor"
                tooltip="Points to currency value ratio."
              />
              <TextField
                fullWidth
                type="number"
                value={form.points_conversion_factor}
                onChange={(e) =>
                  handleChange("points_conversion_factor", e.target.value)
                }
              />
            </Grid>
            {/* )} */}

            {/* {selectedBurnType?.value === "PERCENTAGE" && ( */}
            <Grid item xs={12}>
              <InfoLabel
                label="Max Burn % on Invoice"
                tooltip="Maximum invoice value percentage that can be paid using points."
              />
              <TextField
                fullWidth
                type="number"
                value={form.max_burn_percent_on_invoice}
                onChange={(e) =>
                  handleChange("max_burn_percent_on_invoice", e.target.value)
                }
              />
            </Grid>
            {/* )} */}
          </>
        )}

        {/* Validity for user After Assigned */}
        {form.rule_type !== "burn" && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Valid for (Days) After Assigned to User"
              value={form.validity_after_assignment}
              type="number"
              inputProps={{ min: 0 }}
              name="validity_after_assignment"
              onChange={(e) =>
                handleChange("validity_after_assignment", e.target.value)
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={tooltipMessagesValidityAfterAssignmentForRule}
                    >
                      <IconButton edge="end">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        {/* Frequency */}
        <Grid item xs={12}>
          <InfoLabel
            label="Frequency"
            tooltip="Defines how often this rule can be applied: 
      • once – rewarded only one time ever, 
      • yearly – rewarded once every year, 
      • daily – rewarded once per day."
          />

          <TextField
            select
            fullWidth
            value={form.frequency}
            onChange={(e) => handleChange("frequency", e.target.value)}
          >
            {FREQUENCY.map((singleFrequency, index) => (
              <MenuItem value={singleFrequency.value} key={index}>
                {singleFrequency.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Mark as Priority */}
        {["dynamic rule", "burn"].includes(form.rule_type) && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="is_priority"
                  checked={!!form.is_priority}
                  onChange={(e) =>
                    handleChange("is_priority", e.target.checked)
                  }
                />
              }
              label="Mark as Priority"
            />
          </Grid>
        )}

        <Grid
          item
          xs={12}
          marginLeft="16px"
          marginTop="16px"
          border={`1px solid ${theme.palette.secondary.light}`}
          borderRadius={2}
          paddingRight={2}
        >
          <Typography variant="h4" color="primary">
            Tiers
          </Typography>
          <Alert>
            <Typography variant="body1">
              You can select multiple tiers, once you select one you will see
              point conversion factor, you can change that point conversion
              fatcor for each tier customers so they get different benefits
              according to there tier
            </Typography>
          </Alert>
          <br />

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
                      label={tier.name}
                    />
                  </Grid>

                  <Grid item xs={8}>
                    {/* {selected && selectedCampaignType?.value === "POINTS" && ( */}
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
                    {/* )} */}
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
                  value={form.ruleBasicInfo.locales[langId]?.description || ""}
                  setValue={(value: string) => {
                    setForm((prev) => ({
                      ...prev,
                      ruleBasicInfo: {
                        ...prev.ruleBasicInfo,
                        locales: {
                          ...prev.ruleBasicInfo.locales,
                          [langId]: {
                            ...(prev.ruleBasicInfo.locales[langId] || {}),
                            description: value || "",
                          },
                        },
                      },
                    }));
                  }}
                  language={langCode}
                  onBlur={async () => {
                    if (langCode === "en") {
                      const englishText =
                        form.ruleBasicInfo.locales[langId]?.description || "";
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

                            setForm((prev) => ({
                              ...prev,
                              ruleBasicInfo: {
                                ...prev.ruleBasicInfo,
                                locales: {
                                  ...prev.ruleBasicInfo.locales,
                                  [targetLangId]: {
                                    ...(prev.ruleBasicInfo.locales[
                                      targetLangId
                                    ] || {}),
                                    description: translatedText || "",
                                  },
                                },
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

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          {loading ? <CircularProgress size={24} /> : "Create Rule"}
        </Button>
      </Box>
    </>
  );
};

export default RuleCreateForm;
