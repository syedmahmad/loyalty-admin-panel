'use client';

import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { GET, PUT } from '@/utils/AxiosUtility';
import { RichTextEditor } from '@/components/TextEditor';

type Campaign = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  type: 'seasonal' | 'referral' | 'targeted' | '';
  budget: number;
  color: string;
  is_active: boolean;
  business_unit_id: number;
};

type BusinessUnit = {
  id: number;
  name: string;
};

const campaignTypes = ['seasonal', 'referral', 'targeted'];

const EditCampaign = () => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');
  const router = useRouter();
  const [description, setDescription] = useState<string>('');
  const [campaignId, setCampaignId] = useState<number | null>(paramId ? +paramId : null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedRules, setSelectedRules] = useState<number[]>([]);

  const [formData, setFormData] = useState<Omit<Campaign, 'id'>>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    type: '',
    budget: 0,
    color: '#000000',
    is_active: true,
    business_unit_id: 0,
  });

  const clientInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('client-info') || '{}') : {};
  const updated_by = clientInfo?.id;

  // Fetch rules
  const fetchRules = async () => {
    const res = await GET('/rules');
    if (res?.status === 200) setRules(res.data);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchCampaigns = async () => {
    const res = await GET('/campaigns');
    if (res?.status === 200) {
      setCampaigns(res.data);
    }
  };

  const fetchBusinessUnits = async () => {
    const res = await GET('/business-units');
    if (res?.status === 200) {
      setBusinessUnits(res.data);
    }
  };

  const fetchCampaignDetails = async (id: number) => {
    const res = await GET(`/campaigns/${id}`);
    if (res?.status === 200) {
      const data = res.data;
      setFormData({
        name: data.name,
        description: data.description,
        type: data.type || '',
        budget: data.budget,
        color: data.color || '#000000',
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        business_unit_id: data.business_unit_id,
      });
      setDescription(data.description || '');
      // Set selected rule targets
      const targetRules = data.rule_targets?.map((rt: any) => rt.rule_id) ?? [];
      setSelectedRules(targetRules)
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.business_unit_id) {
      return toast.error('Please fill all required fields');
    }

    setLoading(true);

    const payload = {
      ...formData,
      description: description || '',
      updated_by,
      start_date: dayjs(formData.start_date).toISOString(),
      end_date: dayjs(formData.end_date).toISOString(),
      rule_targets: selectedRules.map((rule_id) => ({
        rule_id,
      })),
    };

    const res = await PUT(`/campaigns/${campaignId}`, payload);

    if (res?.status === 200) {
      toast.success('Campaign updated!');
      router.push('/campaigns/view');
    } else {
      toast.error('Failed to update campaign');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBusinessUnits();
    fetchCampaigns();
    fetchRules();
  }, []);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails(campaignId).finally(() => setFetching(false));
    }
  }, [campaignId]);

  if (!campaignId) {
    return (
      <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Select Campaign to Edit
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Campaign</InputLabel>
          <Select
            value=""
            onChange={(e) => {
              setCampaignId(+e.target.value);
            }}
            label="Select Campaign"
          >
            {campaigns.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>
    );
  }

  if (fetching) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ width: 600, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        ✏️ Edit Campaign
      </Typography>

      <TextField
        fullWidth
        label="Campaign Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        margin="normal"
        required
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Business Unit</InputLabel>
        <Select
          value={formData.business_unit_id}
          onChange={(e) => handleChange('business_unit_id', e.target.value)}
          label="Business Unit"
        >
          {businessUnits.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Attach Rules</InputLabel>
        <Select
          multiple
          value={selectedRules}
          onChange={(e) =>
            setSelectedRules(
              typeof e.target.value === 'string'
                ? e.target.value.split(',').map(Number)
                : e.target.value
            )
          }
          label="Attach Rules"
        >
          {rules.map((rule) => (
            <MenuItem key={rule.id} value={rule.id}>
              {`${rule.name.toUpperCase()} — ${rule.rule_type} ${rule.max_points_limit}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>


      {/* <TextField
        fullWidth
        label="Description"
        multiline
        rows={3}
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        margin="normal"
      /> */}
      <Typography variant="subtitle1" gutterBottom>
        Description (optional)
      </Typography>
      <RichTextEditor value={description} setValue={setDescription} language="en" />

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <DatePicker
          label="Start Date"
          value={dayjs(formData.start_date)}
          onChange={(newDate) => handleChange('start_date', newDate?.toISOString())}
        />
        <DatePicker
          label="End Date"
          value={dayjs(formData.end_date)}
          onChange={(newDate) => handleChange('end_date', newDate?.toISOString())}
        />
      </Box>

      <FormControl fullWidth margin="normal">
        <InputLabel>Campaign Type</InputLabel>
        <Select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          label="Campaign Type"
        >
          {campaignTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Budget"
        type="number"
        value={formData.budget}
        onChange={(e) => handleChange('budget', e.target.value)}
        margin="normal"
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Typography mr={2}>Color:</Typography>
        <input
          type="color"
          value={formData.color}
          onChange={(e) => handleChange('color', e.target.value)}
          style={{ width: 50, height: 35, border: 'none', cursor: 'pointer' }}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
        }
        label="Active"
        sx={{ mt: 2 }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Campaign'}
      </Button>
    </Card>
  );
};

export default EditCampaign;
