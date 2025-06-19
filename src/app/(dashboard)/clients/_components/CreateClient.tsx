import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  TextField,
  Button,
  Typography,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import CustomPhoneInput from "./CustomPhoneNoField";
import * as yup from "yup";

const CreateClient = ({ reFetch, openModal, setOpenModal }: any) => {

  // #region general for state variables
  const theme = useTheme();

  const [lang, setLang] = useState("en");
  const [formErrors, setFormErrors] = useState<any>({});

  const [clientInfo, setClientInfo] = useState({
    email: "",
    phone_number: "",
    country_code: "+91",
    // senderId: "senderIsMoengage",
    logo: "",
    contact_person_name: "",
    address: "",
  });

  // #endregion


  // #region to handle change in state and show updated data on in the states
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleLangChange = (e: any) => {
    setLang(e.target.value);
  };

  // #endregion

  // #region for schema
  const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    phone_number: yup
      .string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .min(clientInfo.country_code === "+91" ? 10 : 9, "Phone number too short")
      .required("Phone number is required"),
    // senderId: yup.string().required("Sender ID is required"),
    logo: yup
      .string()
      .url("Logo must be a valid URL")
      .required("Logo URL is required"),
    contact_person_name: yup
      .string()
      .required("Client name is required"),
    address: yup.string().required("Address is required"),
  });

  // #endregion


  // #region for creating client and validating the entered data
  const handleSubmit = async () => {

    const lcData = localStorage.getItem('user');
    const parseLCData = lcData && JSON.parse(lcData);
    const userId  = parseLCData.id
    try {
      await schema.validate(clientInfo, { abortEarly: false });
      setFormErrors({});

      const payload = {
        contact_email: clientInfo.email,
        contact_phone: clientInfo.phone_number,
        country_code: clientInfo.country_code,
        userId: userId.toString(),
        status: "active",
        // senderId: clientInfo.senderId,
        logo: clientInfo.logo,
        locales: [
          {
            lang_code: lang,
            contact_person_name: clientInfo.contact_person_name,
            address: clientInfo.address,
            status: "active",
          },
        ],
      };

      const token = localStorage.getItem('token');

      const response = await POST("client/create", payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': token
        }
      });
      if (response?.status === 201) {
        toast.success("Client Register Successfully");
        reFetch();
        setOpenModal(false);
      }
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const errors: any = {};
        err.inner.forEach((error: any) => {
          errors[error.path] = error.message;
        });
        setFormErrors(errors);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // #endregion


  
  const arabicLabels = {
    email: "البريد الإلكتروني",
    phone_number: "رقم الهاتف",
    senderId: "معرّف المرسل",
    logo: "رابط الشعار",
    contact_person_name: "اسم جهة الاتصال",
    address: "العنوان",
    register: "تسجيل العميل",
  };

  const isArabic = lang === "ar";

  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={12}>
        <Typography
          variant="h4"
          color={theme.palette.primary.dark}
          textTransform="capitalize"
          align="center"
        >
          Register Clients
        </Typography>
      </Grid2>

      <Grid2 xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select value={lang} label="Language" onChange={handleLangChange}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">Arabic</MenuItem>
          </Select>
        </FormControl>
      </Grid2>

      <Grid2 xs={12} md={6}>
        <CustomTextfield
          required
          fullWidth
          name="email"
          label={isArabic ? arabicLabels.email : "Email"}
          type="text"
          id="email"
          value={clientInfo.email}
          onChange={handleChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          inputProps={{ dir: isArabic ? "rtl" : "ltr" }}
          lang={lang}
        />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <CustomPhoneInput
          value={clientInfo.phone_number}
          countryCode={clientInfo.country_code}
          onCountryCodeChange={(newCode) => {
            setClientInfo((prev) => ({
              ...prev,
              country_code: newCode,
            }));
          }}
          onChange={(e: any) => {
            const value = e.target.value.replace(/\D/g, "");
            setClientInfo((prev) => ({
              ...prev,
              phone_number: value,
            }));
          }}
          error={!!formErrors.phone_number}
          helperText={formErrors.phone_number}
          fieldsetcolor={theme.palette.primary.dark}
          placeholder={isArabic ? "أدخل رقم الهاتف" : "Enter phone number" }
        />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <CustomTextfield
          required
          fullWidth
          name="logo"
          label={isArabic ? arabicLabels.logo : "Logo URL"}
          type="text"
          id="logo"
          value={clientInfo.logo}
          onChange={handleChange}
          error={!!formErrors.logo}
          helperText={formErrors.logo}
          inputProps={{ dir: isArabic ? "rtl" : "ltr" }}
          lang={lang}
        />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <CustomTextfield
          required
          fullWidth
          name="contact_person_name"
          label={isArabic ? arabicLabels.contact_person_name : "Client Name"}
          type="text"
          id="contact_person_name"
          value={clientInfo.contact_person_name}
          onChange={handleChange}
          error={!!formErrors.contact_person_name}
          helperText={formErrors.contact_person_name}
          inputProps={{ dir: isArabic ? "rtl" : "ltr" }}
          lang={lang}
        />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <CustomTextfield
          required
          fullWidth
          name="address"
          label={isArabic ? arabicLabels.address : "Address"}
          type="text"
          id="address"
          value={clientInfo.address}
          onChange={handleChange}
          error={!!formErrors.address}
          helperText={formErrors.address}
          inputProps={{ dir: isArabic ? "rtl" : "ltr" }}
          lang={lang}
        />
      </Grid2>

      <Grid2 xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          {isArabic ? arabicLabels.register : "Register Client"}
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default CreateClient;
