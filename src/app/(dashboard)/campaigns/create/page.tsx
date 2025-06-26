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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { POST, GET } from '@/utils/AxiosUtility';
import dayjs from 'dayjs';
import { RichTextEditor } from '@/components/TextEditor';

type BusinessUnit = {
  id: number;
  name: string;
};

const campaignTypes = ['seasonal', 'referral', 'targeted'];

const CreateCampaign = () => {
  const router = useRouter();
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [rules, setRules] = useState<any[]>([]);
  const [selectedRules, setSelectedRules] = useState<number[]>([]);

  const fetchRules = async () => {
    const res = await GET('/rules');
    if (res?.status === 200) setRules(res.data);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: dayjs(),
    end_date: dayjs(),
    type: '',
    budget: '',
    color: '#000000',
    is_active: true,
    business_unit_id: '',
  });

  const clientInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('client-info') || '{}') : {};
  const tenant_id = clientInfo?.id;
  const created_by = clientInfo?.id;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchBusinessUnits = async () => {
    const res = await GET('/business-units');
    if (res?.status === 200) {
      setBusinessUnits(res.data);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.business_unit_id || !formData.start_date || !formData.end_date) {
      return toast.error('Please fill all required fields');
    }

    setLoading(true);

    const payload = {
      ...formData,
      description: description,
      start_date: formData.start_date.toISOString(),
      end_date: formData.end_date.toISOString(),
      budget: +formData.budget || null,
      type: formData.type || null,
      tenant_id,
      created_by,
      updated_by: created_by,
      rule_targets: selectedRules.map((rule_id) => ({
        rule_id,
      })),
    };

    const res = await POST('/campaigns', payload);
    if (res?.status === 201) {
      toast.success('Campaign created!');
      router.push('/campaigns/view');
    } else {
      toast.error('Failed to create campaign');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBusinessUnits();
    fetchRules();
  }, []);

  return (
    <Card sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        🎯 Create Campaign
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
        <InputLabel>Select Rules</InputLabel>
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
          renderValue={(selected) =>
            rules
              .filter((rule) => selected.includes(rule.id))
              .map((r) => `${r.type}-${r.condition_type} ${r.operator} ${r.value}`)
              .join(', ')
          }
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
          value={formData.start_date}
          onChange={(newDate) => handleChange('start_date', newDate)}
        />
        <DatePicker
          label="End Date"
          value={formData.end_date}
          onChange={(newDate) => handleChange('end_date', newDate)}
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
        {loading ? 'Creating...' : 'Create Campaign'}
      </Button>
    </Card>
  );
};

export default CreateCampaign;
