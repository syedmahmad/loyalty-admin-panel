import React, { Dispatch } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Dialog,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

interface Props {
  openVersionHistoryModal: boolean;
  setOpenVersionHistoryModal: Dispatch<React.SetStateAction<boolean>>;
  versionHistoryData: any;
  reFetch: any;
}

export const VersionHistoryModalForWhatsApp = ({
  openVersionHistoryModal,
  setOpenVersionHistoryModal,
  versionHistoryData,
  reFetch,
}: Props) => {
  return (
    <Dialog
      open={openVersionHistoryModal}
      onClose={() => setOpenVersionHistoryModal(false)}
      sx={{
        "& .MuiDialog-paper": {
          padding: "24px",
          borderRadius: "12px",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenVersionHistoryModal(false)}
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

      <Typography
        variant="h4"
        sx={{
          mt: 7,
          mb: 3,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        Version History
      </Typography>
      <Grid2 container>
        <VersionHistoryCard
          versionHistoryData={versionHistoryData}
          setOpenVersionHistoryModal={setOpenVersionHistoryModal}
          reFetch={reFetch}
        />
      </Grid2>
    </Dialog>
  );
};

export const VersionHistoryCard = ({
  versionHistoryData,
  setOpenVersionHistoryModal,
  reFetch,
}: any) => {
  if (
    !versionHistoryData ||
    versionHistoryData.templateHistory.length === 0 ||
    versionHistoryData.localeHistory.length === 0 ||
    versionHistoryData.previousSendersInfo.length === 0
  ) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" color="textSecondary">
          No version history available.
        </Typography>
      </Box>
    );
  }

  // Combine `templateHistory` and `localeHistory` data for display
  const combinedHistory = versionHistoryData.templateHistory.map(
    (template: any, index: any) => {
      const locale = versionHistoryData.localeHistory[index];
      const sender = versionHistoryData.previousSendersInfo[index];
      return {
        id: template?.rowId,
        type: template.previous_data.type,
        template_name: template.previous_data.template_name,
        subject: locale ? locale.previous_data.subject : "",
        body: locale ? locale.previous_data.body : "",
        languageCode: locale ? locale.previous_data.language_code : "en",
        senderName: sender ? sender?.locales[0].name : "",
        sender_id: sender?.uuid,
      };
    }
  );

  const handleSwitchVersion = async (history: any) => {
    const { id, type, template_name, subject, body, languageCode, sender_id } =
      history;
    const payload = {
      type,
      template_name: template_name,
      translations: [
        { language_code: languageCode, subject, body, sender_id: sender_id },
      ],
    };

    try {
      const response = await PUT(`/templates/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': localStorage.getItem('token')
        }
      });
      if (response?.status === 200) {
        toast.success("Switched to this version successfully");
        setOpenVersionHistoryModal(false);
        reFetch();
      }
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const theme = useTheme();
  const isAboveMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {combinedHistory.map((history: any, idx: any) => {
        if (!history.body) return null;
        return (
          <Card
            key={idx}
            sx={{
              p: 3,
              borderRadius: 3,
              minWidth: isAboveMd ? "600px" : "370px",
              background: "linear-gradient(to right, #ffffff, #f7f7f7)",
              mx: "auto",
              boxShadow: 6,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h5" sx={{ textAlign: "center" }}>
              Version {idx + 1}
            </Typography>
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
                {history.template_name}
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
                {history.subject}
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#444",
                  mb: 2,
                }}
              >
                Sender: {history.senderName}
              </Typography>

              {/* Email Body Section */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  minHeight: "120px",
                  maxHeight: "300px",
                  overflow: "auto",
                  border: "1px solid #ddd",
                }}
              >
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {history.body}
                </Markdown>
              </Box>
            </CardContent>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSwitchVersion(history)}
              >
                Switch to this version
              </Button>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
};
