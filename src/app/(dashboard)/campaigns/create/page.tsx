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
import { useEffect, useState } from 'react';
import { GET, POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/TextEditor';

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
};

const CampaignCreate = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bus, setBus] = useState<number[]>([]);
  const [allBus, setAllBus] = useState<any[]>([]);
  const [ruleTypes, setRuleTypes] = useState<string[]>([]);
  const [rulesByType, setRulesByType] = useState<Record<string, any[]>>({});
  const [selectedRules, setSelectedRules] = useState<Record<string, number[]>>({});
  const [tiers, setTiers] = useState<{ tier_id: number; point_conversion_rate: number }[]>([]);
  const [allTiers, setAllTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string>('');

  const RULE_TYPES = ['event based earn', 'spend and earn', 'burn', 'dynamic rule'];

  const fetchInitialData = async () => {
    const [buRes, tierRes, rulesRes] = await Promise.all([
      GET('/business-units'),
      GET('/tiers'),
      GET('/rules'),
    ]);

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

  const handleRuleTypeAdd = () => {
    setRuleTypes((prev) => [...prev, '']);
  };

  const handleRuleTypeChange = (index: number, value: string) => {
    const updated = [...ruleTypes];
    updated[index] = value;
    setRuleTypes(updated);
  };

  const isTierSelected = (id: number) => tiers.some((t) => t.tier_id === id);

  const handleTierToggle = (tierId: number) => {
    setTiers([{tier_id: tierId, point_conversion_rate: 0}]);
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
      setSelectedRules({ ...selectedRules, [type]: current.filter((id) => id !== ruleId) });
    } else {
      setSelectedRules({ ...selectedRules, [type]: [...current, ruleId] });
    }
  };

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate || bus.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }
  
    const ruleIds: number[] = Object.values(selectedRules).flat();
    const rulesPayload = ruleIds.map((id) => ({ rule_id: id }));
    const tiersPayload = tiers.map((t) => ({
      tier_id: t.tier_id,
      point_conversion_rate: Number(t.point_conversion_rate),
    }));
    
  
    const payloads = bus.map((business_unit_id) => ({
      name,
      start_date: startDate,
      end_date: endDate,
      business_unit_id,
      rules: rulesPayload,
      tiers: tiersPayload,
      description: description
    }));
  
    // setLoading(true);
  
    try {
      await Promise.all(payloads.map((payload) => POST('/campaigns', payload)));
      toast.success('Campaign(s) created!');
      router.push('/campaigns/view');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create one or more campaigns');
    }
  
    setLoading(false);
  };
  
  

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        🎯 Create Campaign
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

            <FormGroup sx={{ mt: 1 }}>
              {(rulesByType[type] || []).map((rule) => (
                <Box key={rule.id} sx={{ display: 'flex', alignItems: 'center'}}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedRules[type]?.includes(rule.id) || false}
                      onChange={() => handleRuleToggle(type, rule.id)}
                    />
                  }
                  label={rule.name}
                />
                {rule.description && <Typography variant='body1'>
                  {`(${htmlToPlainText(rule.description)})` || '-'}
                </Typography>}
                </Box>
              ))}
            </FormGroup>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button variant="outlined" onClick={handleRuleTypeAdd}>
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
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Create Campaign'}
        </Button>
      </Box>
    </Card>
  );
};

export default CampaignCreate;
