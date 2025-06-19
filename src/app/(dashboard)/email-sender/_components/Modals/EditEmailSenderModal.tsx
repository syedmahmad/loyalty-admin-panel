import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  MenuItem,
  Select,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid2 from "@mui/material/Unstable_Grid2";
import { CustomTextfield } from "@/components/CustomTextField";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { PUT } from "@/utils/AxiosUtility";
import CustomPhoneInput from "@/app/(dashboard)/clients/_components/CustomPhoneNoField";

export const EditEmailSenderModal = ({
  openEditSenderModal,
  setOpenEditSenderModal,
  senderToBeEdited,
  reFetch,
}: any) => {
  const [formData, setFormData] = useState({
    languageCode: "",
    name: "",
    senderPhone: "",
    countryCode: "",
    senderEmail: "",
  });

  useEffect(() => {
    if (senderToBeEdited) {
      const locale = senderToBeEdited.locales[0] || {};
      setFormData({
        languageCode: locale.language_code || "",
        name: locale.name || "",
        senderPhone: locale.sender_phone_no || "",
        countryCode: locale.country_code,
        senderEmail: locale.sender_email || "",
      });
    }
  }, [senderToBeEdited]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const payload = {
      id: senderToBeEdited.id,
      locales: [
        {
          language_code: formData.languageCode,
          name: formData.name,
          sender_phone_no: formData.senderPhone,
          country_code: formData.countryCode,
          sender_email: formData.senderEmail,
        },
      ],
    };

    try {
      const response = await PUT(`/senders/${senderToBeEdited.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': localStorage.getItem('token')
        }
      });
      if (response?.status === 200) {
        toast.success("Sender updated successfully");
        setOpenEditSenderModal(!openEditSenderModal);
        reFetch();
      }
    } catch (error) {
      console.error("Error updating sender:", error);
    }
  };

  const theme = useTheme();
  const isAboveMd = useMediaQuery(theme.breakpoints.up("md"));

  // Define label translations
  const labels: any = {
    en: {
      title: "Edit Sender",
      language: "Language",
      name: "Name",
      phone: "Phone Number",
      email: "Email",
      save: "Save",
    },
    ar: {
      title: "تعديل المرسل",
      language: "اللغة",
      name: "الاسم",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
      save: "حفظ",
    },
  };

  const currentLabels = labels[formData.languageCode] || labels.en;

  return (
    <Dialog
      open={openEditSenderModal}
      onClose={() => setOpenEditSenderModal(!openEditSenderModal)}
      sx={{
        "& .MuiDialog-paper": {
          padding: "24px",
          maxWidth: isAboveMd ? "600px" : "auto",
          borderRadius: "12px",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenEditSenderModal(!openEditSenderModal)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography
        variant="h4"
        sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}
      >
        {currentLabels.title}
      </Typography>

      <Grid2 container spacing={2}>
        {/* <Grid2 xs={12} md={6}>
          <Select
            name="languageCode"
            value={formData.languageCode}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">العربية</MenuItem>
          </Select>
        </Grid2> */}

        <Grid2 xs={12}>
          <CustomTextfield
            label={currentLabels.name}
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid2>

        <Grid2 xs={12}>
          {/* <CustomTextfield
            label={currentLabels.phone}
            name="senderPhone"
            value={formData.senderPhone}
            onChange={handleChange}
          /> */}

          {/* <CustomPhoneInput
            value={formData.senderPhone}
            countryCode={formData.countryCode}
            onCountryCodeChange={(newCode: any) => {
              setFormData((prev) => ({
                ...prev,
                countryCode: newCode,
              }));
            }}
            onChange={(e: any) => {
              const value = e.target.value.replace(/\D/g, "");
              setFormData((prev) => ({
                ...prev,
                senderPhone: value,
              }));
            }}
            // error={!!errors.phone_number}
            // helperText={errors.phone_number}
            fieldsetcolor={theme.palette.primary.dark}
            placeholder={
              formData.languageCode === "ar"
                ? "أدخل رقم الهاتف"
                : "Enter phone number"
            }
          /> */}
        </Grid2>

        <Grid2 xs={12}>
          <CustomTextfield
            label={currentLabels.email}
            name="senderEmail"
            value={formData.senderEmail}
            onChange={handleChange}
          />
        </Grid2>
      </Grid2>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {currentLabels.save}
        </Button>
      </Box>
    </Dialog>
  );
};
