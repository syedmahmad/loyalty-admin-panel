"use client";

import {
  Alert,
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
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useRef, useState } from "react";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/TextEditor";
import CouponCard from "@/components/cards/CouponCard";

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const CampaignCreate = ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bus, setBus] = useState<number[]>([]);
  const [allBus, setAllBus] = useState<any[]>([]);
  const [ruleTypes, setRuleTypes] = useState<string[]>([]);
  const [availableRuleTypes, setAvailableRuleTypes] = useState<string[]>([]);
  const [rulesByType, setRulesByType] = useState<Record<string, any[]>>({});
  const [selectedRules, setSelectedRules] = useState<Record<string, number[]>>(
    {}
  );
  const [tiers, setTiers] = useState<
    { tier_id: number; point_conversion_rate: number }[]
  >([]);
  const [allTiers, setAllTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allSegments, setAllSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState<any>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const ALL_RULE_TYPES = [
    "event based earn",
    "spend and earn",
    "burn",
    "dynamic rule",
  ];

  const fetchInitialData = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const [buRes, tierRes, rulesRes, couponsRes, segmentsRes] = await Promise.all([
      GET(`/business-units/${clientInfo.id}`),
      GET(`/tiers/${clientInfo.id}`),
      GET(`/rules/${clientInfo.id}`),
      GET(`/coupons/${clientInfo.id}?&limit=5`),
      GET(`/customer-segments/${clientInfo.id}`),
    ]);

    setAllBus(buRes?.data || []);
    setAllTiers(tierRes?.data?.tiers || []);
    setAllCoupons(couponsRes?.data?.coupons || []);
    setAllSegments(segmentsRes?.data || []);
    const groupedRules = (rulesRes?.data || []).reduce(
      (acc: any, rule: any) => {
        acc[rule.rule_type] = acc[rule.rule_type] || [];
        acc[rule.rule_type].push(rule);
        return acc;
      },
      {}
    );

    setRulesByType(groupedRules);
    setAvailableRuleTypes(ALL_RULE_TYPES);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

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

  const handleConversionRateChange = (tierId: number, value: number) => {
    setTiers((prev) =>
      prev.map((t) =>
        t.tier_id === tierId ? { ...t, point_conversion_rate: value } : t
      )
    );
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

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate || bus.length === 0) {
      toast.error("Please fill all required fields");
      return;
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

    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const payloads = bus.map((business_unit_id) => ({
      name,
      start_date: startDate,
      end_date: endDate,
      business_unit_id,
      rules: rulesPayload,
      tiers: tiersPayload,
      coupons: couponsPayload,
      description,
      client_id: clientInfo.id,
      customer_segment_ids: segmentIds,
    }));

    setLoading(true);

    try {
      await Promise.all(payloads.map((payload) => POST("/campaigns", payload)));
      toast.success("Campaign(s) created!");
      // router.push('/campaigns/view');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create one or more campaigns");
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

  return (
    <>
      {/* <Tooltip title="Go Back">
        <IconButton onClick={() => router.back()} sx={{ width: 120, color: theme.palette.primary.main }}>
          <ArrowBackIcon /> &nbsp; Go Back
        </IconButton>
      </Tooltip>
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}> */}
      {/* <Typography variant="h5" fontWeight={600} gutterBottom>
        🎯 Create Campaign
      </Typography> */}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Campaign Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>

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
            <InputLabel>BUs</InputLabel>
            <Select
              multiple
              value={bus}
              onChange={(e) => setBus(e.target.value as number[])}
              label="BUs"
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
            getOptionLabel={(option) => option.name}
            value={selectedSegments}
            onChange={(event, newValue) => setSelectedSegments(newValue)}
            filterSelectedOptions
            isOptionEqualToValue={(option, value) => option.id === value.id}
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


        {ruleTypes.map((type, idx) => (
          <Grid key={idx} item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl fullWidth>
                <InputLabel>Rule Type</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => handleRuleTypeChange(idx, e.target.value)}
                  label="Rule Type"
                >
                  {[type, ...availableRuleTypes.filter((t) => t !== type)].map(
                    (rt) => (
                      <MenuItem key={rt} value={rt}>
                        {rt}
                      </MenuItem>
                    )
                  )}
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
              {(rulesByType[type] || []).map((rule) => (
                <Box
                  key={rule.id}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          selectedRules[type]?.includes(rule.id) || false
                        }
                        onChange={() => handleRuleToggle(type, rule.id)}
                      />
                    }
                    label={rule.name}
                  />
                  {rule.description && (
                    <Typography variant="body1">
                      ({htmlToPlainText(rule.description)})
                    </Typography>
                  )}
                </Box>
              ))}
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
          <FormGroup>
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
                  {selected && (
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
          </FormGroup>
        </Grid>

        {/* Coupons */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={allCoupons}
            getOptionLabel={(option) => option.coupon_title}
            value={selectedCoupons}
            onChange={(event, newValue: any) => setSelectedCoupons(newValue)}
            filterSelectedOptions
            isOptionEqualToValue={(option, value) => option.id === value.id}
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

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          {loading ? <CircularProgress size={24} /> : "Create Campaign"}
        </Button>
      </Box>
    </>
  );
};

export default CampaignCreate;
