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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GET, PUT } from "@/utils/AxiosUtility";
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

const initialForm = {
  name: "",
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
};

interface BurnTypeOption {
  label: string;
  value: string;
}

const RuleEdit = ({ onSuccess }: { onSuccess: () => void }) => {
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
  const [loading, setLoading] = useState(false);
  const [selectedBurnType, setSelectedBurnType] =
    useState<BurnTypeOption | null>({
      label: "FIXED",
      value: "FIXED",
    });

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
      });
      setDescription(rule.description || "");

      const burnType: any = BURN_TYPES.find(
        (singleBurnType) => singleBurnType.value === rule.burn_type
      );
      setSelectedBurnType(burnType);
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

  const handleSubmit = async () => {
    if (!form.name || !form.rule_type) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      (form.rule_type === "event based earn" &&
        (!form.event_triggerer || !form.reward_points)) ||
      (form.rule_type === "spend and earn" &&
        (!form.min_amount_spent || !form.reward_points)) ||
      (form.rule_type === "burn" &&
        (!form.min_amount_spent ||
          !form.max_redeemption_points_limit ||
          (selectedBurnType?.value === "FIXED" &&
            !form.points_conversion_factor) ||
          (selectedBurnType?.value === "PERCENTAGE" &&
            !form.max_burn_percent_on_invoice)))
    ) {
      toast.error("Please fill all required fields for this rule type");
      return;
    }

    if (
      form.rule_type === "dynamic rule" &&
      form.conditions.length &&
      !form.conditions.every(
        ({ condition_type, condition_operator, condition_value }) =>
          condition_type?.trim() &&
          condition_operator?.trim() &&
          condition_value?.toString().trim()
      )
    ) {
      toast.error("Please fill all fields for dynamic rule");
      return;
    }

    setLoading(true);

    const burnType = form.rule_type === "burn" ? selectedBurnType?.value : null;

    const payload = {
      name: form.name,
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
      updated_by,
      burn_type: burnType,
      reward_condition: form.reward_condition,
      dynamic_conditions:
        form.rule_type === "dynamic rule" ? form.conditions : null,
      is_priority: form.is_priority ? 1 : 0,
    };

    const res = await PUT(`/rules/${selectedId}`, payload);

    if (res?.status === 200) {
      toast.success("Rule updated successfully!");
      onSuccess();
    } else {
      toast.error("Failed to update rule");
    }

    setLoading(false);
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
          <Grid item xs={12}>
            <InfoLabel
              label="Rule Name "
              tooltip="Enter a descriptive name for this rule."
            />
            <TextField
              fullWidth
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
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

          {form.rule_type === "dynamic rule" &&
            form.conditions?.map((eachCondition, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" gap={1} alignItems={"center"}>
                  <TextField
                    label="Condition Type"
                    fullWidth
                    value={eachCondition.condition_type}
                    onChange={(e) => {
                      const updated = [...form.conditions];
                      updated[index].condition_type = e.target.value;
                      handleChange("conditions", updated);
                    }}
                  />
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
              <Grid item xs={12}>
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
              </Grid>

              <Grid item xs={12}>
                <InfoLabel
                  label="Max Redeemable Points"
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

              {selectedBurnType?.value === "FIXED" && (
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
              )}

              {selectedBurnType?.value === "PERCENTAGE" && (
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
                      handleChange(
                        "max_burn_percent_on_invoice",
                        e.target.value
                      )
                    }
                  />
                </Grid>
              )}
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
          {form.rule_type === "dynamic rule" && (
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
