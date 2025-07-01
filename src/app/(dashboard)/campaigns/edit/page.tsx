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
  InputLabel,
  MenuItem,
  Radio,
  Select,
  TextField,
  Typography,
} from '@mui/material';
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

const CampaignEdit = () => {
  const router = useRouter();
  const params = useSearchParams();
  const paramId = params.get('id') || null;

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bus, setBus] = useState<number | null>(null);
  const [allBus, setAllBus] = useState<any[]>([]);
  const [rulesByType, setRulesByType] = useState<Record<string, any[]>>({});
  const [selectedRules, setSelectedRules] = useState<Record<string, number[]>>({});
  const [ruleTypes, setRuleTypes] = useState<string[]>([]);
  const [tiers, setTiers] = useState<{ tier_id: number; point_conversion_rate: number }[]>([]);
  const [allTiers, setAllTiers] = useState<any[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const RULE_TYPES = ['event based earn', 'spend and earn', 'burn', 'dynamic rule'];

  const fetchInitialData = async () => {
    const [buRes, tierRes, rulesRes, campaignRes] = await Promise.all([
      GET('/business-units'),
      GET('/tiers'),
      GET('/rules'),
      GET(`/campaigns/${paramId}`),
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

    setSelectedRules(grouped);
    setRuleTypes(Object.keys(grouped));

    setAllBus(buRes?.data || []);
    setAllTiers(tierRes?.data?.tiers || []);

    const groupedRules = (rulesRes?.data || []).reduce((acc: any, rule: any) => {
      acc[rule.rule_type] = acc[rule.rule_type] || [];
      acc[rule.rule_type].push(rule);
      return acc;
    }, {});
    setRulesByType(groupedRules);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleRuleToggle = (type: string, ruleId: number) => {
    const current = selectedRules[type] || [];
    if (current.includes(ruleId)) {
      setSelectedRules({ ...selectedRules, [type]: current.filter((id) => id !== ruleId) });
    } else {
      setSelectedRules({ ...selectedRules, [type]: [...current, ruleId] });
    }
  };

  const handleRuleTypeAdd = () => {
    setRuleTypes((prev) => [...prev, RULE_TYPES[0]]);
  };

  const handleRuleTypeChange = (index: number, value: string) => {
    const updated = [...ruleTypes];
    updated[index] = value;
    setRuleTypes(updated);
  };

  const isTierSelected = (id: number) => tiers.some((t) => t.tier_id === id);

  const handleTierToggle = (tierId: number) => {
    setTiers([{ tier_id: tierId, point_conversion_rate: 0 }]);
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
        router.push('/campaigns/view');
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
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        ✏️ Edit Campaign
      </Typography>

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

        <Grid item xs={12}>
          <Button variant="outlined" onClick={handleRuleTypeAdd}>
            ➕ Add Rule Type
          </Button>
        </Grid>

        {ruleTypes.map((type, idx) => (
          <Grid key={idx} item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Rule Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => handleRuleTypeChange(idx, e.target.value)}
                label="Rule Type"
              >
                {RULE_TYPES.map((rt) => (
                  <MenuItem key={rt} value={rt}>
                    {rt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {type !== '' && rulesByType[type]?.length > 0 && (
              <FormGroup sx={{ mt: 1 }}>
                {rulesByType[type].map((rule) => (
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
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({htmlToPlainText(rule.description)})
                      </Typography>
                    )}
                  </Box>
                ))}
              </FormGroup>
            )}

          </Grid>
        ))}

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
                      <Radio
                        checked={selected}
                        onChange={() => handleTierToggle(tier.id)}
                      />
                    }
                    label={tier.name}
                  />
                  {selected && (
                    <TextField
                      type="number"
                      label="Conversion Rate"
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
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Update Campaign'}
        </Button>
      </Box>
    </Card>
  );
};

export default CampaignEdit;
