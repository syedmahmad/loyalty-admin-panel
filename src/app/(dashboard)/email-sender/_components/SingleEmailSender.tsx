import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Card, CardContent, Typography, IconButton, Box, Stack, Button
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifyOtpModal from "./Modals/VerifyOTP";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

export const SingleEmailSender = ({
  sender,
  handleEditSender,
  handleDeleteSender,
  reFetch,
}: any) => {
  const isArabic = sender?.locales[0].language_code === "ar";

  return (
    <Grid2 xs={12} sm={6} md={4} key={sender?.id} marginTop={2}>
      <Card sx={{ position: "relative", p: 2 }}>
        {/* Icon Buttons at the Top */}
        <Box
          sx={{
            position: "absolute",
            top: isArabic ? 5 : 8,
            right: 8,
            left: "auto",
            display: "flex",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <IconButton color="warning" onClick={() => handleEditSender(sender)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteSender(sender)}>
            <DeleteIcon />
          </IconButton>
        </Box>

        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              direction: isArabic ? "rtl" : "ltr",
              textAlign: isArabic ? "right" : "left",
              lineHeight: "32px",
            }}
          >
            {isArabic ? "الاسم" : "Name"}: {sender?.locales[0]?.name}
          </Typography>

          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              direction: isArabic ? "rtl" : "ltr",
              textAlign: isArabic ? "right" : "left",
              lineHeight: "32px",
              mb: 1,
            }}
          >
            {isArabic ? "بريد إلكتروني" : "Email"}:{" "}
            {sender?.locales[0]?.sender_email}
          </Typography>

          {/* <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              direction: isArabic ? "rtl" : "ltr",
              textAlign: isArabic ? "right" : "left",
              lineHeight: "32px",
            }}
          >
            {isArabic ? "رقم الهاتف" : "Phone No"}:{" "}
            {sender?.locales[0]?.country_code}{" "}
            {sender?.locales[0]?.sender_phone_no}
          </Typography> */}

          {!sender.active ? (
            <ActionButtons refetch={reFetch} sender={sender} />
          ) : (
            <PlaceholderBox />
          )}
        </CardContent>
      </Card>
    </Grid2>
  );
};

function ActionButtons({ refetch, sender }: any) {
  const [openVerifyModal, setOpenVerifyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleReSendOtp = async () => {
    const localStorgae =
      typeof window !== "undefined" ? window.localStorage : null;
    const userDetails = JSON.parse(localStorgae?.getItem("user")!);
    setLoading(true);
    // Logic to re-send OTP
    try {
      const res = await POST("senders/send-otp", {
        senderId: sender.id,
        user_email: userDetails.email!,
      });

      console.log("res", res);

      toast.success("OTP sent successfully!");
      setLoading(false);
    } catch {
      toast.error(
        "Verification failed. Please try again. Or check your selected sender email"
      );
      setLoading(false);
    }
  };
  return (
    <Stack direction="row" spacing={1}>
      <Button
        disabled={loading}
        variant="contained"
        size="small"
        color="primary"
        onClick={handleReSendOtp}
      >
        {!loading ? "Re-Send OTP" : "Sending..."}
      </Button>
      <Button
        variant="outlined"
        size="small"
        color="secondary"
        onClick={() => setOpenVerifyModal(true)}
      >
        Verify OTP
      </Button>

      <VerifyOtpModal
        open={openVerifyModal}
        onClose={() => setOpenVerifyModal(false)}
        senderId={sender.id} // Replace with actual senderId
        onVerified={() => {
          refetch();
          setOpenVerifyModal(false);
        }}
      />
    </Stack>
  );
}

function PlaceholderBox() {
  return (
    <Stack direction="row" spacing={1}>
      <Box
        sx={{
          height: 32, // same as small button height
          minWidth: 160, // adjust based on button group width
          borderRadius: 1,
        }}
      />
    </Stack>
  );
}
