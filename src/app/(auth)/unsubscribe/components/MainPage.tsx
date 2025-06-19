import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import * as yup from "yup";
import CustomPhoneInput from '@/app/(dashboard)/clients/_components/CustomPhoneNoField';
import { POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

const categories = [
  'Promotions',
  'Product Updates',
  'Newsletters',
  'Surveys',
  'Event Invitations',
];

const channels: ('Email' | 'SMS' | 'WhatsApp')[] = ['Email', 'SMS', 'WhatsApp'];

type Preferences = {
  [key in typeof channels[number]]: {
    [category: string]: boolean;
  };
};

function splitCountryCode(fullNumber: string): { countryCode: string; phoneNumber: string } {
  const countryCodes = ['+91', '+92', '+966'];

  if (fullNumber) {
    const match = countryCodes.find(code => fullNumber.startsWith(code));
    if (match) {
      return {
        countryCode: match,
        phoneNumber: fullNumber.slice(match.length),
      };
    }
  }

  return {
    countryCode: '+966',
    phoneNumber: ""
  }
}

const UnsubscribePage: React.FC<any> = ({
  emailCategories,
  smsCategories,
  whatsappCategories,
  resp,
  email,
  number,
  userEmail,
  userNumber,
}: any) => {
  console.log("userEmail", userEmail);
  
  const showEmailFields = !email && !number;
  const getAllPreviousUnsubscribeData = resp.unsubscribedUsers || [];
  const [preferences, setPreferences] = useState<Preferences>({
    Email: {},
    SMS: {},
    WhatsApp: {},
  });

  const numberData = splitCountryCode(resp.number);

  const [formData, setFormData] = useState({
    country_code: numberData?.countryCode,
    language: "en",
    phone_no: numberData?.phoneNumber,
    email: resp?.email || "",
  });

  const [loading, setLoading] = useState(false);

  // Yup Validation Schema
  const schema = yup.object({
    // language: yup.string().required(t.language + " is required"),
    phone_no: yup
      .string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .min(formData.country_code === "+91" ? 10 : 9, "Phone number too short")
      .required("Phone number is required"),
    email: yup
      .string()
      .email("Invalid email")
      .required("Email is required"),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Preferences = {
      Email: {},
      SMS: {},
      WhatsApp: {},
    };
    channels.forEach((channel) => {
      if (channel === 'Email') {
        const emailUnsubscribed = getAllPreviousUnsubscribeData.filter((item: any) => item.type === 'email');
        emailCategories.forEach((cat: any) => {
          const isUnsubscribed = emailUnsubscribed.some((entry: any) => entry.category_id === cat.id);
          initial[channel][cat.id] = isUnsubscribed; // true if found, else false
        });
      } else if (channel === "SMS") {
        const smsUnsubscribed = getAllPreviousUnsubscribeData.filter((item: any) => item.type === 'sms');
        smsCategories.forEach((cat: any) => {
          const isUnsubscribed = smsUnsubscribed.some((entry: any) => entry.category_id === cat.id);
          initial[channel][cat.id] = isUnsubscribed;
        });
      } else {
        const whatsappUnsubscribed = getAllPreviousUnsubscribeData.filter((item: any) => item.type === 'whatsapp');
        whatsappCategories.forEach((cat: any) => {
          const isUnsubscribed = whatsappUnsubscribed.some((entry: any) => entry.category_id === cat.id);
          initial[channel][cat.id] = isUnsubscribed;
        });
      }
    });
    setPreferences(initial);
  }, []);

  const handleChange = (channel: keyof Preferences, category: string) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [category]: !prev[channel][category],
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!email && !number) {
        schema.validateSync(formData, { abortEarly: false });
      }
      setLoading(true);
      const result: {
        category_id: string;
        type: 'email' | 'sms' | 'whatsapp';
        is_unsubscribed: boolean;
      }[] = [];
    
      (Object.keys(preferences) as Array<keyof typeof preferences>).forEach((channel) => {
        Object.entries(preferences[channel]).forEach(([categoryId, isUnsubscribed]) => {
          result.push({
            category_id: categoryId,
            type: channel.toLowerCase() as 'email' | 'sms' | 'whatsapp',
            is_unsubscribed: isUnsubscribed,
          });
        });
      });

      const payload = {
        email: showEmailFields ? formData.email : userEmail,
        phone_no: showEmailFields ? `${formData.country_code}${formData.phone_no}` : userNumber,
        preferences: result,
      }

      const res = await POST('/unsubscribe/user', payload)

      if (res?.status === 201) {
        // Handle success, e.g., show a success message or redirect
        toast.success("You're successfully unsubscribed from the selected categories")
        setErrors({});
      } else {
        toast.error("Something went wrong while unsubcribing please try reloading the page and try again")
      }
    } catch (error: any) {
      if (error instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        toast.error("Something went wrong, please try again.");
      }
    }
    
    if (showEmailFields) {
      setPreferences({
        Email: {},
        SMS: {},
        WhatsApp: {},
      });
      setFormData({
        country_code: "+91",
        language: "en",
        phone_no: "",
        email: "",
      });
    }
    setLoading(false);
    // Add your API call here
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 6, px: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Your Communication Preferences
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Select the categories you want to unsubscribe from for each communication channel.
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {showEmailFields && (
          <>
            <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={"Email Address"}
              name="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }));
              }}
              error={!!errors.email}
              helperText={errors.email}
            />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomPhoneInput
                value={formData.phone_no}
                countryCode={formData.country_code}
                onCountryCodeChange={(newCode: any) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    country_code: newCode,
                  }));
                }}
                onChange={(e: any) => {
                  const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                  setFormData((prev) => ({
                    ...prev,
                    phone_no: value,
                  }));
                }}
                error={!!errors.phone_no}
                helperText={errors.phone_no}
                placeholder="Phone Number"
              />
            </Grid>
          </>
        )}
        {channels.map((channel) => {
          if (channel === "Email" && (userEmail === null || userEmail === undefined) && !showEmailFields) return null;
          if (channel === "SMS" && (userNumber === null || userNumber === undefined) && !showEmailFields) return null;
          if (channel === "WhatsApp" && (userNumber === null || userNumber === undefined) && !showEmailFields) return null;
          if (channel === "Email" && emailCategories.length === 0) return null;
          if (channel === "SMS" && smsCategories.length === 0) return null;
          if (channel === "WhatsApp" && whatsappCategories.length === 0) return null;
          return(
            <Grid item xs={12} md={!userEmail || !userNumber ? 6 : 4} key={channel}>
              <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, minHeight: 200, maxHeight: 200, overflowY: 'auto' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <strong>{channel}</strong>
                  </Typography>
                  <FormGroup>
                    {channel === "Email" && emailCategories.length > 0 ? emailCategories.map((category: any) => (
                      <FormControlLabel
                        key={category.id}
                        control={
                          <Checkbox
                            checked={preferences?.[channel]?.[category.id] || false}
                            onChange={() => handleChange(channel, category.id)}
                            disabled={userEmail === null && !showEmailFields}
                          />
                        }
                        label={category.name}
                      />
                    )) : channel === "SMS" && smsCategories.length > 0 ? smsCategories.map((category: any) => (
                      <FormControlLabel
                        key={category.id}
                        control={
                          <Checkbox
                            checked={preferences?.[channel]?.[category.id] || false}
                            onChange={() => handleChange(channel, category.id)}
                            disabled={userNumber === null && !showEmailFields}
                          />
                        }
                        label={category.name}
                      />
                    )) : whatsappCategories.length > 0 && whatsappCategories.map((category: any) => (
                      <FormControlLabel
                        key={category.id}
                        control={
                          <Checkbox
                            checked={preferences?.[channel]?.[category.id] || false}
                            onChange={() => handleChange(channel, category.id)}
                            disabled={userNumber === null && !showEmailFields}
                          />
                        }
                        label={category.name}
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          )})}
      </Grid>

      
      <Box textAlign="center" mt={5}>
      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={loading}
        sx={{ borderRadius: 3, px: 5, py: 1.5 }}
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </Button>
      </Box>
    </Box>
  );
};

export default UnsubscribePage;
