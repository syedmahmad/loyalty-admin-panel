import React from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "react-quill-new/dist/quill.snow.css";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { PATCH } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

interface ViewTempLateModalProps {
  openViewTemplateModal: boolean;
  setOpenViewTemplateModal: React.Dispatch<React.SetStateAction<boolean>>;
  templateToBeViewed: any;
  reFetch: any;
}

export const ViewTempLateModal = ({
  openViewTemplateModal,
  setOpenViewTemplateModal,
  templateToBeViewed,
  reFetch,
}: ViewTempLateModalProps) => {
  const handleClose = () => setOpenViewTemplateModal(false);
  const theme = useTheme();
  const isAboveMd = useMediaQuery(theme.breakpoints.up("md"));

  const isActive = templateToBeViewed.active;

  const handleUseTemplate = async () => {
    const payload = { active: true };
    try {
      const resp = await PATCH(`/templates/${templateToBeViewed.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': localStorage.getItem('token')
        }
      });
      if (resp?.status === 200) {
        toast.success(
          isArabic 
            ? "القالب نشط الآن" 
            : "Template is now active"
        );        
        reFetch();
        setOpenViewTemplateModal(false);
      }
    } catch (error) {
      toast.error(
        isArabic 
          ? "حدث خطأ ما. حاول مرة أخرى" 
          : "Something went wrong. Try again"
      );
      
    }
  };

  const isArabic = templateToBeViewed?.translations[0]?.language_code === "ar";

  return (
    <Dialog
      open={openViewTemplateModal}
      onClose={handleClose}
      maxWidth={isAboveMd ? "lg" : "xs"}
      sx={{
        "& .MuiDialog-paper": {
          padding: "24px",
          minWidth: isAboveMd ? "400px" : "auto",
          borderRadius: "12px",
        },
      }}
    >
      {/* Close Button */}
      <Box sx={{ position: "relative" }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Title */}
      <Typography
        variant="h4"
        sx={{ mt:5, mb: 3, textAlign: "center", fontWeight: 600 }}
      >
        {isArabic ? "عرض القالب"  : "View Template"}
      </Typography>

      {/* Template Rendering */}
      {templateToBeViewed?.type === "email" ? (
        <RenderEmailTemplate templateToBeViewed={templateToBeViewed} />
      ) : (
        <RenderSMSTemplate templateToBeViewed={templateToBeViewed} />
      )}

      {/* Action Button */}
      {isActive ? (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Typography variant="subtitle1" >{isArabic ? "القالب نشط بالفعل" : "Template Is Already Active"}</Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseTemplate}
          >
            {isArabic ? "استخدم هذا القالب" : "Use This Template"}
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export const RenderEmailTemplate = ({ templateToBeViewed }: any) => {
  const isArabic = templateToBeViewed?.translations[0]?.language_code === "ar";

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        background: "linear-gradient(to right, #ffffff, #f7f7f7)",
        maxWidth: "650px",
        mx: "auto",
        boxShadow: 6,
        border: "1px solid #e0e0e0",
        textAlign: isArabic ? "right" : "left",
        direction: isArabic ? "rtl" : "ltr",
      }}
    >
      <CardContent>
        {/* Template Name */}
        <Typography
          variant="h4"
          sx={{
            mb: 1.5,
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
          }}
        >
          {templateToBeViewed?.template_name ||
            (isArabic ? "بدون عنوان" : "Untitled")}
        </Typography>

        {/* Subject */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#444",
            mb: 2,
          }}
        >
          {templateToBeViewed?.translations[0].subject}
        </Typography>

        {/* Email Body Section */}
        <Box
          sx={{
            p: 2,
            backgroundColor: "#fff",
            borderRadius: 2,
            // boxShadow: "inset 0px 2px 6px rgba(0,0,0,0.1)",
            minHeight: "120px",
            maxHeight: "300px",
            overflow: "auto",
            border: "1px solid #ddd",
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {templateToBeViewed?.translations[0].body}
          </Markdown>
        </Box>
      </CardContent>
    </Card>
  );
};

const RenderSMSTemplate = ({ templateToBeViewed }: any) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box
        sx={{
          backgroundColor: "#dcf8c6",
          padding: "12px",
          borderRadius: "12px",
          maxWidth: "75%",
          textAlign: "left",
          boxShadow: 1,
        }}
      >
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {templateToBeViewed?.translations[0]?.body || "Hello"}
        </Markdown>
      </Box>
      <br />
      <Box
        sx={{
          backgroundColor: "#dcf8c6",
          padding: "12px",
          borderRadius: "12px",
          maxWidth: "75%",
          textAlign: "left",
          boxShadow: 1,
          direction: "rtl",
        }}
      >
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {templateToBeViewed?.translations[1]?.body || "Hello"}
        </Markdown>
      </Box>
    </Box>
  );
};
