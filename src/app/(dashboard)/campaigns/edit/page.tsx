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
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { GET, PUT } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { RichTextEditor } from '@/components/TextEditor';

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
  const [tiers, setTiers] = useState<number[]>([]);
  const [allTiers, setAllTiers] = useState<any[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInitialData = async () => {
    const [buRes, tierRes, rulesRes, campaignRes] = await Promise.all([
      GET('/business-units'),
      GET('/tiers'),
      GET('/rules'),
      GET(`/campaigns/${paramId}`),
    ]);

    const campaign = campaignRes?.data;

    setName(campaign.name);
    setStartDate(campaign.start_date.split('T')[0]);
    setEndDate(campaign.end_date.split('T')[0]);
    setBus(campaign.business_unit_id);
    setDescription(campaign.description || '');

    setTiers(campaign.tiers.map((t: any) => t.tier.id));

    // Convert rules into { [rule_type]: number[] }
    const grouped: Record<string, number[]> = {};
    campaign.rules.forEach((r: any) => {
      const type = r.rule.rule_type;
      const id = r.rule.id;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(id);
    });
    setSelectedRules(grouped);

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

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate || !bus) {
      toast.error('Please fill all required fields');
      return;
    }

    const ruleIds: number[] = Object.values(selectedRules).flat();
    const rulesPayload = ruleIds.map((id) => ({ rule_id: id }));
    const tiersPayload = tiers.map((id) => ({ tier_id: id }));

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

        {Object.entries(rulesByType).map(([type, rules]) => (
          <Grid key={type} item xs={12}>
            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>{type}</Typography>
            <FormGroup>
              {rules.map((rule) => (
                <FormControlLabel
                  key={rule.id}
                  control={
                    <Checkbox
                      checked={selectedRules[type]?.includes(rule.id) || false}
                      onChange={() => handleRuleToggle(type, rule.id)}
                    />
                  }
                  label={rule.name}
                />
              ))}
            </FormGroup>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Typography variant="subtitle1">Tiers</Typography>
          <FormGroup>
            {allTiers.map((tier) => (
              <FormControlLabel
                key={tier.id}
                control={
                  <Checkbox
                    checked={tiers.includes(tier.id)}
                    onChange={() => {
                      setTiers((prev) =>
                        prev.includes(tier.id)
                          ? prev.filter((id) => id !== tier.id)
                          : [...prev, tier.id]
                      );
                    }}
                  />
                }
                label={tier.name}
              />
            ))}
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
