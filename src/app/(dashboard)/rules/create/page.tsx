"use client";

import {
  Box,
  Button,
  Card,
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
import React, { useEffect, useState } from "react";
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

const RuleCreateForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter();
  const userInfo = JSON.parse(localStorage.getItem("client-info") || "{}");
  const created_by = userInfo?.id;

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
    business_unit_id: "",
  };

  const [form, setForm] = useState(initialForm);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [selectedBurnType, setSelectedBurnType] =
    useState<BurnTypeOption | null>({
      label: "FIXED",
      value: "FIXED",
    });

  const theme = useTheme();
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
      ["dynamic rule", "burn"].includes(form.rule_type) &&
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

    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);

    const burnType = form.rule_type === "burn" ? selectedBurnType?.value : null;

    const payload = {
      name: form.name,
      slug: slugify(form.name, {
        replacement: "_",
        lower: true,
      }),
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
      description,
      created_by,
      burn_type: burnType,
      dynamic_conditions: ["dynamic rule", "burn"].includes(form.rule_type)
        ? form.conditions
        : null,
      is_priority: form.is_priority ? 1 : 0,
      business_unit_id: form.business_unit_id,
    };

    const response = await POST("/rules", payload);

    if (response?.status === 201) {
      toast.success("Rule created successfully!");
      setForm(initialForm);
      setDescription("");
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
      const [buData] = await Promise.all([fetchBusinessUnits()]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessUnitInfo();
  }, []);

  console.log("form:::", form);

  return (
    <>
      {/* <Tooltip title="Go Back">
        <IconButton onClick={() => router.back()} sx={{ width: 120, color: theme.palette.primary.main }}>
          <ArrowBackIcon /> &nbsp; Go Back
        </IconButton>
      </Tooltip> */}

      {/* <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        ➕ Create Rule
      </Typography> */}

      <Grid container spacing={2}>

        {/* Rule Name */}
        <Grid item xs={12}>
          <InfoLabel
            label="Rule Name"
            tooltip="Name of the rule to identify it easily."
          />
          <TextField
            fullWidth
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
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
            <Grid item xs={12}>
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
                    handleChange("max_burn_percent_on_invoice", e.target.value)
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
