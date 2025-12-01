"use client";

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  InputLabel,
  useTheme,
  InputAdornment,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GET, POST, PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { RichTextEditor } from "@/components/TextEditor";
import {
  BURN_TYPES,
  REWARD_CONDITIONS,
  tooltipMessagesValidityAfterAssignmentForRule,
} from "@/constants/constants";
import { FREQUENCY } from "@/constants/constants";
import slugify from "slugify";
import ConditionTypeDropdown from "@/components/third-party/ConditionTypeInput";
import { BusinessUnit } from "../../coupons/types";

const initialForm = {
  name: "",
  name_ar: "",
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

interface BurnTypeOption {
  label: string;
  value: string;
}

const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const response = await GET(`/business-units/${clientInfo.id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

const RuleEdit = ({ onSuccess }: any) => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get("uuid");
  const router = useRouter();
  const clientInfo = JSON.parse(localStorage.getItem("client-info") || "{}");
  const updated_by = clientInfo?.id;
  const theme = useTheme();
  const [form, setForm] = useState(initialForm);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(paramId || "");
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
  // const [selectedBurnType, setSelectedBurnType] =
  //   useState<BurnTypeOption | null>({
  //     label: "FIXED",
  //     value: "FIXED",
  //   });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadRuleDetails = async (ruleId: string) => {
    setLoading(true);
    const res = await GET(`/rules/single/${ruleId}`);
    const rule = res?.data;

    if (rule) {
      setForm({
        name: rule.name,
        name_ar: rule.name_ar || "",
        rule_type: rule.rule_type,
        min_amount_spent: rule.min_amount_spent?.toString() || "",
        reward_points: rule.reward_points?.toString() || "",
        event_triggerer: rule.event_triggerer || "",
        max_redeemption_points_limit:
          rule.max_redeemption_points_limit?.toString() || "",
        points_conversion_factor:
          rule.points_conversion_factor?.toString() || "",
        max_burn_percent_on_invoice:
          rule.max_burn_percent_on_invoice?.toString() || "",
        condition_type: rule.condition_type || "",
        condition_operator: rule.condition_operator || "",
        condition_value: rule.condition_value || "",
        validity_after_assignment: rule.validity_after_assignment || 0,
        frequency: rule.frequency || "once",
        reward_condition: rule.reward_condition || "minimum",
        conditions: rule.dynamic_conditions || form.conditions,
        is_priority: rule.is_priority,
        business_unit_id: rule.business_unit_id || 0,
      });
      setTiers(
        rule.tiers.map((t: any) => ({
          tier_id: t.tier.id,
          point_conversion_rate: parseFloat(t.point_conversion_rate) || 1,
        }))
      );
      setDescription(rule.description || "");
      setDescriptionAr(rule.description_ar || "");

      const burnType: any = BURN_TYPES.find(
        (singleBurnType) => singleBurnType.value === rule.burn_type
      );
      // setSelectedBurnType(burnType);
    }
    setLoading(false);
  };

  const fetchAllRules = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(`/rules/${clientInfo.id}`);
    setRules(res?.data || []);
  };

  useEffect(() => {
    if (paramId) {
      setSelectedId(paramId);
      loadRuleDetails(paramId);
    } else {
      fetchAllRules();
    }
  }, [paramId]);

  const fetchBusinessUnitInfo = async () => {
    setLoading(true);
    try {
      const [buData] = await Promise.all([fetchBusinessUnits()]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessUnitInfo();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.rule_type || !form.business_unit_id) {
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

    // const burnType = form.rule_type === "burn" ? selectedBurnType?.value : null;

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

    const tiersPayload = tiers.map((t) => ({
      tier_id: t.tier_id,
      point_conversion_rate: Number(t.point_conversion_rate) || 1,
    }));

    const payload = {
      name: form.name,
      name_ar: form.name_ar,
      slug: slugify(form.name, {
        replacement: "_",
        lower: true,
      }),
      rule_type: form.rule_type,
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
      description,
      description_ar: descriptionAr,
      updated_by,
      // burn_type: burnType,
      reward_condition: form.reward_condition,
      dynamic_conditions: ["dynamic rule", "burn"].includes(form.rule_type)
        ? form.conditions
        : null,
      is_priority: form.is_priority ? 1 : 0,
      tiers: tiersPayload,
      business_unit_id: form.business_unit_id,
    };

    try {
      const res = await PUT(`/rules/${selectedId}`, payload);

      if (res?.status === 200) {
        toast.success("Rule updated successfully!");
        onSuccess();
      } else {
        toast.error("Failed to update rule");
      }
    } catch (error: any) {
      if (!toast.isActive("fetch-rules-error")) {
        toast.error(
          error?.response?.data?.message ||
            "An error occurred while editing the rule",
          {
            toastId: "fetch-rules-error",
          }
        );
      }
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

  const handleArabictranslate = async (
    key: string,
    value: string,
    richEditor: boolean = false
  ) => {
    try {
      setTranslationLoading((prev) => ({ ...prev, [key]: true }));
      const res = await POST("/openai/translate-to-arabic", { value });
      if (res?.data.status) {
        if (richEditor) {
          setDescriptionAr(res?.data?.data);
        } else {
          console.log("Translating", key, res?.data?.data);

          handleChange(key, res?.data?.data);
        }
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

  return (
    <>
      {/* <Tooltip title="Go Back">
        <IconButton onClick={() => router.back()} sx={{ width: 120, color: theme.palette.primary.main }}>
          <ArrowBackIcon /> &nbsp; Go Back
        </IconButton>
      </Tooltip>

      <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        ✏️ Edit Rule
      </Typography> */}

      {!paramId && (
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {/* Select Rule */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Rule"
              value={selectedId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedId(id);
                loadRuleDetails(id);
              }}
              margin="normal"
            >
              {rules.map((rule) => (
                <MenuItem key={rule?.uuid} value={rule?.uuid}>
                  {rule.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}

      {selectedId && (
        <Grid container spacing={2}>
          {/* Rule Name */}
          <Grid item xs={12}>
            <InfoLabel
              label="Rule Name "
              tooltip="Enter a descriptive name for this rule."
            />
            <TextField
              fullWidth
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={(e) => {
                handleArabictranslate("name_ar", e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {translationLoading["name_ar"] && (
                      <CircularProgress size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Rule Name Ar */}
          <Grid item xs={12}>
            <InfoLabel
              label="Rule Name Ar"
              tooltip="Name of the rule to identify it easily."
            />
            <TextField
              fullWidth
              value={form.name_ar}
              onChange={(e) => handleChange("name_ar", e.target.value)}
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
              tooltip="Select the type of rule logic to apply."
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

          {/* {form.rule_type === "dynamic rule" && (
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Condition Type"
                    value={form.condition_type}
                    onChange={(e) =>
                      handleChange("condition_type", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    fullWidth
                    label="Operator"
                    value={form.condition_operator}
                    onChange={(e) =>
                      handleChange("condition_operator", e.target.value)
                    }
                  >
                    <MenuItem value="==">Equal To (==)</MenuItem>
                    <MenuItem value="!=">Not Equal (!=)</MenuItem>
                    <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                    <MenuItem value=">=">
                      Greater Than or Equal (&gt;=)
                    </MenuItem>
                    <MenuItem value="<">Less Than (&lt;)</MenuItem>
                    <MenuItem value="<=">Less Than or Equal (&lt;=)</MenuItem>
                    <MenuItem value="contains">Contains</MenuItem>
                    <MenuItem value="not_contains">Does Not Contain</MenuItem>
                    <MenuItem value="in">In</MenuItem>
                    <MenuItem value="not_in">Not In</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Condition Value"
                    value={form.condition_value}
                    onChange={(e) =>
                      handleChange("condition_value", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          )} */}

          {["dynamic rule", "burn"].includes(form.rule_type) &&
            form.conditions?.map((eachCondition, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" gap={1} alignItems={"center"}>
                  {/* <TextField
                    select
                    label="Condition Type"
                    fullWidth
                    value={eachCondition.condition_type}
                    onChange={(e) => {
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
                    <MenuItem value=">=">
                      Greater Than or Equal (&gt;=)
                    </MenuItem>
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
                onChange={(e) =>
                  handleChange("reward_condition", e.target.value)
                }
              >
                {REWARD_CONDITIONS.map((condition) => (
                  <MenuItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {form.rule_type === "event based earn" && (
            <Grid item xs={12}>
              <InfoLabel
                label="Event Triggerer"
                tooltip="Triggering event like signup or birthday."
              />
              <TextField
                fullWidth
                value={form.event_triggerer}
                onChange={(e) =>
                  handleChange("event_triggerer", e.target.value)
                }
                placeholder="e.g. signup, birthday"
              />
            </Grid>
          )}

          {(form.rule_type === "spend and earn" ||
            form.rule_type === "burn" ||
            form.rule_type === "dynamic rule") && (
            <Grid item xs={12}>
              <InfoLabel
                label={`${
                  form.reward_condition === "minimum" ? "Minimum" : "Per"
                }  Amount Spent`}
                tooltip={`${
                  form.reward_condition === "minimum" ? "Minimum" : "Per"
                } spend amount to activate the rule.`}
              />
              <TextField
                fullWidth
                type="number"
                value={form.min_amount_spent}
                onChange={(e) =>
                  handleChange("min_amount_spent", e.target.value)
                }
              />
            </Grid>
          )}

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
                  value={selectedBurnType ?? null}
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
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description (optional)
            </Typography>
            <RichTextEditor
              value={description}
              setValue={setDescription}
              language="en"
              onBlur={(e: any) => {
                handleArabictranslate("description_ar", description, true);
              }}
            />
          </Grid>

          {/* Description Ar*/}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description Ar (optional)
            </Typography>
            <RichTextEditor
              value={descriptionAr}
              setValue={setDescriptionAr}
              language="ar"
            />
          </Grid>
        </Grid>
      )}

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="outlined"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          {loading ? <CircularProgress size={24} /> : "Update Rule"}
        </Button>
      </Box>
    </>
  );
};

export default RuleEdit;

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
