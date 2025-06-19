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
import { Close, Send as SendIcon } from "@mui/icons-material";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ViewTemplateWhileCreating {
  openViewTemplateModalWhileCreate: boolean;
  setOpenViewTemplateModalWhileCreate: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  templateToBeViewed: any;
}

export const ViewTemplateWhileCreating = ({
  openViewTemplateModalWhileCreate,
  setOpenViewTemplateModalWhileCreate,
  templateToBeViewed,
}: ViewTemplateWhileCreating) => {
  const handleClose = () => setOpenViewTemplateModalWhileCreate(false);
  const theme = useTheme();
  const isAboveMd = useMediaQuery(theme.breakpoints.up("md"));

  const [lang, setLang] = useState("en");
  const handleLangChange = (e: any) => {
    setLang(e.target.value);
  };

  const [showOnDesktop, setShowOnDesktop] = useState(false);

  return (
    <Dialog
      open={openViewTemplateModalWhileCreate}
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
          height: showOnDesktop ? "80vh" : "90vh",
          direction: lang === "ar" ? "rtl" : "ltr", // RTL for entire dialog when Arabic
        },
      }}
    >
      {/* Close Button */}
      <Box
        sx={{
          position: "absolute",
          [lang === "ar" ? "left" : "right"]: 8, // Flip position for RTL
          top: 8,
          zIndex: 1300,
        }}
      >
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
          <Close />
        </IconButton>
      </Box>

      {/* Title and Controls */}
      <Box
        sx={{
          p: 2,
          mt: 3,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: lang === "ar" ? "row-reverse" : "row", // Reverse for RTL
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, mt: 4 }}>
          {lang === "ar" ? "معاينة قالب البريد" : "Email Template Preview"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: lang === "ar" ? "row-reverse" : "row",
          }}
        >
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
            {showOnDesktop
              ? lang === "ar"
                ? "عرض الجوال"
                : "Mobile View"
              : lang === "ar"
              ? "عرض سطح المكتب"
              : "Desktop View"}
          </Button>
        </Box>
      </Box>

      {/* Template Rendering */}
      <RenderEmailTemplate
        templateToBeViewed={templateToBeViewed}
        lang={lang}
        showOnDesktop={showOnDesktop}
      />
    </Dialog>
  );
};

interface RenderEmailTemplateProps {
  templateToBeViewed: any;
  lang: string;
  showOnDesktop: boolean;
}

export const RenderEmailTemplate = ({
  templateToBeViewed,
  lang,
  showOnDesktop,
}: RenderEmailTemplateProps) => {
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
        {/* Toolbar */}

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

            {/* Sender Info */}

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
