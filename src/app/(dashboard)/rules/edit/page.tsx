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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GET, PUT } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { RichTextEditor } from '@/components/TextEditor';
import { tooltipMessagesValidityAfterAssignmentForRule } from '@/constants/constants';
import { FREQUENCY } from "@/constants/constants";
import slugify from "slugify";

const initialForm = {
  name: '',
  rule_type: 'event based earn',
  min_amount_spent: '',
  reward_points: '',
  event_triggerer: '',
  max_redeemption_points_limit: '',
  points_conversion_factor: '',
  max_burn_percent_on_invoice: '',
  condition_type: '',
  condition_operator: '',
  condition_value: '',
  validity_after_assignment: 0,
  frequency: "once",
};

const RuleEdit = ({ onSuccess }: { onSuccess: () => void }) => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id");
  const router = useRouter();
  const clientInfo = JSON.parse(localStorage.getItem("client-info") || "{}");
  const updated_by = clientInfo?.id;
  const theme = useTheme();
  const [form, setForm] = useState(initialForm);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(paramId || "");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
        min_amount_spent: rule.min_amount_spent?.toString() || '',
        reward_points: rule.reward_points?.toString() || '',
        event_triggerer: rule.event_triggerer || '',
        max_redeemption_points_limit: rule.max_redeemption_points_limit?.toString() || '',
        points_conversion_factor: rule.points_conversion_factor?.toString() || '',
        max_burn_percent_on_invoice: rule.max_burn_percent_on_invoice?.toString() || '',
        condition_type: rule.condition_type || '',
        condition_operator: rule.condition_operator || '',
        condition_value: rule.condition_value || '',
        validity_after_assignment: rule.validity_after_assignment || 0,
        frequency: rule.frequency || "once",
      });
      setDescription(rule.description || "");
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
          !form.points_conversion_factor ||
          !form.max_burn_percent_on_invoice)) ||
      (form.rule_type === "dynamic rule" &&
        (!form.condition_type ||
          !form.condition_operator ||
          !form.condition_value))
    ) {
      toast.error("Please fill all required fields for this rule type");
      return;
    }

    setLoading(true);

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
      validity_after_assignment: form.validity_after_assignment === 0 ? undefined : form.validity_after_assignment,
      frequency: form.frequency || "once",
      description,
      updated_by,
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
                <MenuItem key={rule.id} value={rule.id}>
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

          {form.rule_type === "dynamic rule" && (
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
            form.rule_type === "burn") && (
            <Grid item xs={12}>
              <InfoLabel
                label="Minimum Amount Spent"
                tooltip="Minimum spend amount to activate the rule."
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
            </>
          )}

          {/* Validity for user After Assigned */}
          {form.rule_type !== 'burn' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Valid for (Days) After Assigned to User"
                value={form.validity_after_assignment}
                type="number"
                inputProps={{ min: 0 }}
                name="validity_after_assignment"
                onChange={(e) => handleChange('validity_after_assignment', e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={tooltipMessagesValidityAfterAssignmentForRule}>
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
