'use client';

import {
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
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { GET, PUT } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { RichTextEditor } from '@/components/TextEditor';

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
};

const CampaignEdit =  ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter();
  const params = useSearchParams();
  const paramId = params.get('id') || null;
  const theme = useTheme();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bus, setBus] = useState<number | null>(null);
  const [allBus, setAllBus] = useState<any[]>([]);
  const [rulesByType, setRulesByType] = useState<Record<string, any[]>>({});
  const [selectedRules, setSelectedRules] = useState<Record<string, number[]>>({});
  const [ruleTypes, setRuleTypes] = useState<string[]>([]);
  const [availableRuleTypes, setAvailableRuleTypes] = useState<string[]>([]);
  const [tiers, setTiers] = useState<{ tier_id: number; point_conversion_rate: number }[]>([]);
  const [allTiers, setAllTiers] = useState<any[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const ALL_RULE_TYPES = ['event based earn', 'spend and earn', 'burn', 'dynamic rule'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const clientInfo = JSON.parse(localStorage.getItem('client-info')!);
    const [buRes, tierRes, rulesRes, campaignRes] = await Promise.all([
      GET(`business-units/${clientInfo.id}`),
      GET(`tiers/${clientInfo.id}`),
      GET(`rules/${clientInfo.id}`),
      GET(`/campaigns/single/${paramId}`),
    ]);

    const campaign = campaignRes?.data;

    setName(campaign.name);
    setStartDate(DateTime.fromISO(campaign.start_date).toFormat('yyyy-MM-dd'));
    setEndDate(DateTime.fromISO(campaign.end_date).toFormat('yyyy-MM-dd'));
    setBus(campaign.business_unit_id);
    setDescription(campaign.description || '');

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
    setAvailableRuleTypes(available);

    setAllBus(buRes?.data || []);
    setAllTiers(tierRes?.data?.tiers || []);

    const groupedRules = (rulesRes?.data || []).reduce((acc: any, rule: any) => {
      acc[rule.rule_type] = acc[rule.rule_type] || [];
      acc[rule.rule_type].push(rule);
      return acc;
    }, {});
    setRulesByType(groupedRules);
  };

  const handleRuleToggle = (type: string, ruleId: number) => {
    const current = selectedRules[type] || [];
    if (current.includes(ruleId)) {
      setSelectedRules({ ...selectedRules, [type]: current.filter((id) => id !== ruleId) });
    } else {
      setSelectedRules({ ...selectedRules, [type]: [...current, ruleId] });
    }
  };

  const handleRuleTypeAdd = () => {
    if (availableRuleTypes.length === 0) return;
    setRuleTypes((prev) => [...prev, '']);
  };

  const handleRuleTypeChange = (index: number, newType: string) => {
    const oldType = ruleTypes[index];
    const updated = [...ruleTypes];
    updated[index] = newType;
    setRuleTypes(updated);

    setAvailableRuleTypes((prev) => {
      let updatedList = prev.filter((t) => t !== newType);
      if (oldType && oldType !== '' && !prev.includes(oldType)) {
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

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate || !bus) {
      toast.error('Please fill all required fields');
      return;
    }

    const ruleIds: number[] = Object.values(selectedRules).flat();
    const rulesPayload = ruleIds.map((id) => ({ rule_id: id }));
    const tiersPayload = tiers.map((t) => ({
      tier_id: t.tier_id,
      point_conversion_rate: Number(t.point_conversion_rate),
    }));

    const payload = {
      name,
      start_date: startDate,
      end_date: endDate,
      business_unit_id: bus,
      rules: rulesPayload,
      tiers: tiersPayload,
      description,
    };

    setLoading(true);
    try {
      const res = await PUT(`/campaigns/${paramId}`, payload);
      if (res?.status === 200) {
        toast.success('Campaign updated!');
       // router.push('/campaigns/view');
       onSuccess();
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
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
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        ✏️ Edit Campaign
      </Typography> */}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Campaign Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
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
            <InputLabel>Business Unit</InputLabel>
            <Select
              value={bus || ''}
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
                  {[type, ...availableRuleTypes.filter((t) => t !== type)].map((rt) => (
                    <MenuItem key={rt} value={rt}>
                      {rt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" color="error" onClick={() => handleRuleTypeRemove(idx)}>
                ➖
              </Button>
            </Box>

            <FormGroup sx={{ mt: 1 }}>
              {(rulesByType[type] || []).map((rule) => (
                <Box key={rule.id} sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRules[type]?.includes(rule.id) || false}
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
          <Button variant="outlined" onClick={handleRuleTypeAdd} disabled={availableRuleTypes.length === 0}>
            ➕ Add Rule Type
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1">Tiers</Typography>
          <FormGroup>
            {allTiers.map((tier) => {
              const selected = isTierSelected(tier.id);
              const current = tiers.find((t) => t.tier_id === tier.id);

              return (
                <Box key={tier.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
                        handleConversionRateChange(tier.id, Number(e.target.value))
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

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Description (optional)
          </Typography>
          <RichTextEditor value={description} setValue={setDescription} language="en" />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="outlined" onClick={handleSubmit} disabled={loading}
          sx={{ fontWeight: 600, textTransform: 'none' }}>
          {loading ? <CircularProgress size={24} /> : 'Update Campaign'}
        </Button>
      </Box>
    
    </>
  );
};

export default CampaignEdit;
