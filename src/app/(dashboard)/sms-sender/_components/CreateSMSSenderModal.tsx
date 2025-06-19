import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  MenuItem,
  Select,
  Button,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid2 from "@mui/material/Unstable_Grid2";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import * as yup from "yup";
import CustomPhoneInput from "../../clients/_components/CustomPhoneNoField";
import OtpModal from "./Modals/VerifyOTPModal";

interface CreateTemplateModalProps {
  openCreateSender: boolean;
  setOpenCreateSender: React.Dispatch<React.SetStateAction<boolean>>;
  reFetch: () => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    createSender: "Create Sender",
    language: "Language",
    english: "English",
    arabic: "Arabic",
    senderName: "Sender Name",
    senderEmail: "Sender Email",
    phoneNumber: "Enter phone number",
    save: "Save",
  },
  ar: {
    createSender: "إنشاء المرسل",
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    senderName: "اسم المرسل",
    senderEmail: "البريد الإلكتروني للمرسل",
    phoneNumber: "أدخل رقم الهاتف",
    save: "حفظ",
  },
};

const CreateSMSSenderModal = ({
  openCreateSender,
  setOpenCreateSender,
  reFetch,
}: CreateTemplateModalProps) => {
  const [formData, setFormData] = useState({
    country_code: "+91",
    language: "en",
    name: "",
    sender_phone_no: "",
    sender_email: "",
  });

  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [loading, setLoading] = useState(false);

  const t = translations[formData.language];

  // Yup Validation Schema
  const schema = yup.object({
    // language: yup.string().required(t.language + " is required"),
    name: yup.string().required(t.senderName + " is required"),
    sender_phone_no: yup
      .string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .min(formData.country_code === "+91" ? 10 : 9, "Phone number too short")
      .required("Phone number is required"),
    // sender_email: yup
    //   .string()
    //   .email("Invalid email")
    //   .required(t.senderEmail + " is required"),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle Input Change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Form Submission Handler
  const handleSubmit = async () => {
    setLoading(true);
    const lcData = localStorage.getItem("client-info");
    const parsedData = lcData && JSON.parse(lcData);
    const clientId = parsedData?.id;
    try {
      schema.validateSync(formData, { abortEarly: false });
      const payload = {
        client_id: clientId,
        active: true,
        locales: [
          {
            language_code: formData.language,
            name: formData.name,
            country_code: formData.country_code,
            sender_phone_no: formData.sender_phone_no,
            sender_email: formData.sender_email,
            type: "sms"
          },
        ],
      };

      const localStorgae =
        typeof window !== "undefined" ? window.localStorage : null;
      const userDetails = JSON.parse(localStorgae?.getItem("user")!);

      const response = await POST("senders/create", payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': localStorage.getItem('token')
        }
      });
      if (response?.status === 201) {
        // toast.success("Sender Created Successfully");
        reFetch();
        setOpenCreateSender(false);

        // try {
        //   await POST("senders/send-otp", {
        //     senderId: response?.data.id,
        //     user_email: userDetails.email!,
        //   });
        //   setOpenOtpModal(true);
        //   setSenderId(response?.data.id);
        // } catch {
        //   toast.error(
        //     "Sender has been created but Its verification failed. Please make sure, it should be verified, otherwise you are not able to use this sender in your templates to send SMS or Emails."
        //   );
        //   setOpenCreateSender(false);
        // }
      }
    } catch (error) {
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

    setLoading(false);
  };

  return (
    <Dialog
      open={openCreateSender}
      onClose={() => setOpenCreateSender(false)}
      sx={{ "& .MuiDialog-paper": { padding: "20px", maxWidth: "600px" } }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenCreateSender(false)}
          sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h5" sx={{ textAlign: "center", mb: 3 }}>
          {t.createSender}
        </Typography>

        <Grid2 container spacing={2}>
          {/* Language Selection */}
          {/* <Grid2 xs={12} md={6}>
            <Select
              fullWidth
              name="language"
              value={formData.language}
              onChange={handleChange}
            >
              <MenuItem value="en">{t.english}</MenuItem>
              <MenuItem value="ar">{t.arabic}</MenuItem>
            </Select>
          </Grid2> */}

          {/* Phone Number */}
          <Grid2 xs={12} >
            <CustomPhoneInput
              value={formData.sender_phone_no}
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
                  sender_phone_no: value,
                }));
              }}
              error={!!errors.sender_phone_no}
              helperText={errors.sender_phone_no}
              placeholder={t.phoneNumber}
            />
          </Grid2>

          {/* Sender Name */}
          <Grid2 xs={12}>
            <TextField
              fullWidth
              label={t.senderName}
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid2>

          {/* Sender Email */}
          {/* <Grid2 xs={12}>
            <TextField
              fullWidth
              label={t.senderEmail}
              name="sender_email"
              value={formData.sender_email}
              onChange={handleChange}
              error={!!errors.sender_email}
              helperText={errors.sender_email}
            />
          </Grid2> */}
        </Grid2>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            disabled={loading}
            variant="contained"
            color="primary"
            onClick={() => handleSubmit()}
          >
            {t.save}
          </Button>
        </Box>
      </Box>

      <OtpModal
        open={openOtpModal}
        onClose={() => setOpenOtpModal(false)}
        senderId={senderId}
        setOpenCreateSender={setOpenCreateSender}
        reFetch={reFetch}
      />
    </Dialog>
  );
};

export default CreateSMSSenderModal;
