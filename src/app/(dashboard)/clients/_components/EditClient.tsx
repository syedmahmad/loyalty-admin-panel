import React, { useState, useEffect } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Button, Typography, useTheme } from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import * as yup from "yup";
import { toast } from "react-toastify";
import { PATCH } from "@/utils/AxiosUtility";
import CustomPhoneInput from "./CustomPhoneNoField";

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone_number: yup
  .string()
  .matches(/^[0-9]+$/, "Must be only digits")
  .required("Phone number is required")
  .test('phone-number-length', 'Phone number is too short', function (value) {
    const { country_code } = this.parent;
    
    if (country_code === '+91') {
      return value && value.length === 10 ? true : false;  // Return true for valid length, false for invalid length
    } else {
      return value && value.length >= 9 ? true : false;  // Adjust for other country codes as needed (e.g., 9 digits)
    }
  }),
country_code: yup.string().required("Country code is required"),
  senderId: yup.string().required("Sender ID is required"),
  logo: yup.string().url("Must be a valid URL"),
  contact_person_name: yup.string().required("Client name is required"),
  address: yup.string().required("Address is required"),
});

const EditClient = ({
  itemToBeEdited,
  reFetch,
  openEditClientInfoModal,
  setOpenEditClientInfoModal,
}: any) => {
  const theme = useTheme();
  const [errors, setErrors] = useState<any>({});
  const [clientInfo, setClientInfo] = useState({
    email: "",
    phone_number: "",
    country_code: "",
    senderId: "",
    logo: "",
    contact_person_name: "",
    address: "",
  });
  useEffect(() => {
    if (itemToBeEdited) {
      setClientInfo({
        email: itemToBeEdited.contact_email || "",
        phone_number: itemToBeEdited.contact_phone || "",
        country_code: itemToBeEdited.country_code || "",
        senderId: itemToBeEdited.senderId || "",
        logo: itemToBeEdited.logo || "",
        contact_person_name:
          itemToBeEdited.localeClients[0]?.contact_person_name || "",
        address: itemToBeEdited.localeClients[0]?.address || "",
      });
    }
  }, [itemToBeEdited]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleSubmit = async (itemToBeEdited: any) => {
    try {
      const payload = {
        contact_email: clientInfo.email,
        contact_phone: clientInfo.phone_number,
        country_code: clientInfo.country_code,
        senderId: clientInfo.senderId,
        logo: clientInfo.logo,
        locales: [
          {
            lang_code: itemToBeEdited.localeClients[0]?.lang_code || "en", // or however you store it
            contact_person_name: clientInfo.contact_person_name,
            address: clientInfo.address,
          },
        ],
      };

      await PATCH(`/client/${itemToBeEdited.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': localStorage.getItem('token')
        }
      });

      toast.success("Updated Successfully!");
      reFetch();
      setOpenEditClientInfoModal(false);
    } catch (err: any) {
      const fieldErrors: any = {};
      err.inner.forEach((error: any) => {
        fieldErrors[error.path] = error.message;
      });
      setErrors(fieldErrors);
    }
  };

  const isArabic = itemToBeEdited.localeClients[0]?.lang_code === "ar";

  const translations = {
    email: isArabic ? "البريد الإلكتروني" : "Email",
    phone_number: isArabic ? "رقم الهاتف" : "Phone Number",
    senderId: isArabic ? "معرف المرسل" : "Sender ID",
    logo: isArabic ? "رابط الشعار" : "Logo URL",
    contact_person_name: isArabic ? "اسم العميل" : "Client Name",
    address: isArabic ? "العنوان" : "Address",
  };
  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={12}>
        <Typography
          variant="h4"
          color={theme.palette.primary.dark}
          textTransform="capitalize"
          align="center"
        >
          {isArabic ? "تحديث معلومات العميل" : "Update Client Info"}
        </Typography>
      </Grid2>

      {Object.entries(translations).map(([key, label]) => {
        if (key === "phone_number") {
          // Render CustomPhoneInput for phone number
          return (
            <Grid2 xs={12} md={6} key={key}>
              <CustomPhoneInput
                value={clientInfo.phone_number}
                countryCode={clientInfo.country_code}
                onCountryCodeChange={(newCode: any) => {
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
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                fieldsetcolor={theme.palette.primary.dark}
                placeholder={
                  isArabic ? "أدخل رقم الهاتف" : "Enter phone number"
                }
              />
            </Grid2>
          );
        } else {
          return (
            <Grid2 xs={12} md={6} key={key}>
              <CustomTextfield
                required
                fullWidth
                name={key}
                label={label}
                value={(clientInfo as any)[key] || ""}
                onChange={handleChange}
                error={Boolean(errors[key])}
                helpertext={errors[key]}
              />
            </Grid2>
          );
        }
      })}

      <Grid2 xs={12} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSubmit(itemToBeEdited)}
        >
          {isArabic ? "تحديث البيانات" : "Update Data"}
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default EditClient;
