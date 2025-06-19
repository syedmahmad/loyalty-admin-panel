import React from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  Button,
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

export const ViewWhatsAppTempLateModal = ({
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
        toast.success(isArabic ? "القالب نشط الآن" : "Template is now active");
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
        sx={{ mt: 5, mb: 3, textAlign: "center", fontWeight: 600 }}
      >
        {isArabic ? "عرض القالب" : "View Template"}
      </Typography>

      {/* Template Rendering */}
      <RenderWhatsAppTemplate templateToBeViewed={templateToBeViewed} />

      {/* Action Button */}
      {isActive ? (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Typography variant="subtitle1">
            {isArabic ? "القالب نشط بالفعل" : "Template Is Already Active"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
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

export const RenderWhatsAppTemplate = ({ templateToBeViewed }: any) => {
  const messages = templateToBeViewed?.translations || [];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 400,
        height: "600px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#e5ddd5",
        boxShadow: 3,
        mx: "auto",
      }}
    >
      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          padding: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#efeae2",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            backgroundColor: "#d4f1fd",
            color: "#4a4a4a",
            borderRadius: "8px",
            padding: "6px 12px",
            textAlign: "center",
            maxWidth: "80%",
            margin: "0px auto",
          }}
        >
          This business uses a secure service from Meta to manage this chat.
        </Typography>

        {/* Loop over messages */}
        {messages.map((msg: any, index: number) => {
          // console.log("msg", msg);
          const isIncoming = index % 2 === 0;
          if (msg.body === "") {
            return null;
          }

          return (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: isIncoming ? "flex-start" : "flex-end",
              }}
            >
              <Box
                sx={{
                  backgroundColor: isIncoming ? "#fff" : "#dcf8c6",
                  padding: "10px 14px",
                  borderRadius: isIncoming
                    ? "8px 8px 8px 0px"
                    : "8px 8px 0px 8px",
                  maxWidth: "75%",
                  boxShadow: 1,
                  fontSize: "14px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg?.header && <b>{msg.header.replace(/^"(.*)"$/, "$1")}</b>}

                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {msg.body}
                </Markdown>

                {msg?.header && <b>{msg.footer.replace(/^"(.*)"$/, "$1")}</b>}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
