import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid2 from "@mui/material/Unstable_Grid2";

// Helper function to extract dynamic fields from the template body
const extractDynamicFields = (template: string): string[] => {
  const regex = /{{\s*[\w_]+\s*}}/g;
  const matches = template.match(regex);
  return matches ? matches.map((m) => m.replace(/{{\s*|\s*}}/g, "")) : [];
};

interface Props {
  openHowToUseTemplateModal: boolean;
  setOpenHowToUseTemplateModal: Dispatch<SetStateAction<boolean>>;
  templateToBeUsed: any;
}

export const HowToUseEmailTemplateModal = ({
  openHowToUseTemplateModal,
  setOpenHowToUseTemplateModal,
  templateToBeUsed,
}: Props) => {
  const [dynamicFields, setDynamicFields] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    if (templateToBeUsed?.translations?.[0]?.body) {
      const templateBody = templateToBeUsed.translations[0].body;
      const fields = extractDynamicFields(templateBody);
      const initialFields = fields.reduce((acc: any, field: any) => {
        acc[field] = "";
        return acc;
      }, {});
      setDynamicFields(initialFields);
    }
  }, [templateToBeUsed]);

  const handleFieldChange = (field: string, value: string) => {
    setDynamicFields((prev) => ({ ...prev, [field]: value }));
  };

  // Prepare dynamic_fields data as plain objects (instead of React elements)
  const dynamicFieldsContent = Object.entries(dynamicFields).reduce(
    (acc, [key, value]) => {
      // @ts-ignore
      acc[key] = "Your Value Here";
      return acc;
    },
    {}
  );

  return (
    <Dialog
      open={openHowToUseTemplateModal}
      onClose={() => setOpenHowToUseTemplateModal(false)}
      maxWidth="sm"
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
          onClick={() => setOpenHowToUseTemplateModal(false)}
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

      <Grid2 container mt={5}>
        <Grid2 xs={12}>
          <Typography variant="h4" textAlign="center" sx={{textTransform:'capitalize'}}>
            This is how you can use this template
          </Typography>
        </Grid2>
        <Grid2 xs={12} mt={2}>
          
          <Box sx={{ margin: 2 }}>
            <Paper
              elevation={5}
              sx={{
                padding: 2,
                backgroundColor: "#f3f3f3",
                borderRadius: 1,
                border: "1px dotted #ddd",
              }}
            >
              <Typography variant="h6" color="primary" mb={1}>
                Your Payload:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  backgroundColor: "#333",
                  color: "#f1f1f1",
                  padding:2,
                  borderRadius: 1,
                }}
              >
                {JSON.stringify(
                  {
                    template_id: (templateToBeUsed.uuid),
                    language_code: "Your Language Code here for example: en or ar",
                    cc_email: "Your CC Email here",
                    bcc: "Your bcc Email here",
                    mail_attachment: [
                      {
                        filename: "Your Filename here",
                        path: "the url of the image"
                      }
                    ],
                    to: [
                      {
                        email: "Enter Email Here",
                        dynamic_fields: dynamicFieldsContent,
                      },
                    ],
                  },
                  null,
                  2
                )}
              </Typography>
            </Paper>
          </Box>
        </Grid2>
        <Grid2 xs={12}>
          <Typography></Typography>
        </Grid2>
      </Grid2>
    </Dialog>
  );
};
