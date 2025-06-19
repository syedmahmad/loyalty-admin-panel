import React, { useState } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  Paper,
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
        toast.success("Template is now active");
        reFetch();
        setOpenViewTemplateModal(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Try again");
    }
  };

  const [lang, setLang] = useState("en");
  const [showOnDesktop, setShowOnDesktop] = useState(false);

  const handleLangChange = (e: any) => {
    setLang(e.target.value);
  };

  return (
    <Dialog
      open={openViewTemplateModal}
      onClose={handleClose}
      maxWidth={showOnDesktop ? "lg" : "sm"}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          padding: 0,
          borderRadius: "8px",
          maxWidth: showOnDesktop ? "1200px" : "500px",
          width: "100%",
          overflowX: "hidden",
          height: "auto",
        },
      }}
    >
      {/* Close Button */}
      <Box sx={{ position: "absolute", right: 8, top: 8, zIndex: 1300 }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            backgroundColor: "rgba(255,255,255,0.7)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.9)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Title and Controls */}
      <Box
        sx={{
          p: 2,
          mt: 5,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Email Template Preview
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Select
            value={lang}
            onChange={handleLangChange}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">Arabic</MenuItem>
          </Select>
          <Button
            variant="outlined"
            onClick={() => setShowOnDesktop(!showOnDesktop)}
            size="small"
          >
            {showOnDesktop ? "Mobile View" : "Desktop View"}
          </Button>
        </Box>
      </Box>

      {/* Template Rendering */}
      <RenderEmailTemplate
        templateToBeViewed={templateToBeViewed}
        lang={lang}
        showOnDesktop={showOnDesktop}
      />

      {/* Action Button */}
      {isActive ? (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1">
            {"Template Is Already Active"}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseTemplate}
          >
            {"Use This Template"}
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export const RenderEmailTemplate = ({
  templateToBeViewed,
  lang,
  showOnDesktop,
}: any) => {
  const isArabic = lang === "ar";
  const translationIndex =
    isArabic && templateToBeViewed?.translations.length > 1 ? 1 : 0;
  const translation = templateToBeViewed?.translations[translationIndex] || {};

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        direction: isArabic ? "rtl" : "ltr",
      }}
    >
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Email Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            bgcolor: "#fff",
            position: "relative",
          }}
        >
          {/* Email Content Area */}
          <Box
            sx={{
              p: showOnDesktop ? 4 : 2,
              maxWidth: showOnDesktop ? "800px" : "100%",
              mx: "auto",
            }}
          >
            {/* Subject */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                fontSize: showOnDesktop ? "1.375rem" : "1.125rem",
                mb: 3,
                color: "#202124",
                textAlign: isArabic ? "right" : "left",
              }}
            >
              {translation.subject || (isArabic ? "بدون عنوان" : "No Subject")}
            </Typography>

            {/* Email Body */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                direction: isArabic ? "rtl" : "ltr",
                textAlign: isArabic ? "right" : "left",
              }}
            >
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {translation.body ||
                  (isArabic ? "لا يوجد محتوى" : "No content")}
              </Markdown>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
