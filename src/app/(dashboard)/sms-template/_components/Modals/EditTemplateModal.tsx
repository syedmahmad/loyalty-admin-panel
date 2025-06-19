import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  MenuItem,
  Select,
  Button,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid2 from "@mui/material/Unstable_Grid2";
import { CustomTextfield } from "@/components/CustomTextField";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { GET, PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { RichTextEditor } from "../RichTextEditor";

export const EditTempLateModal = ({
  openEditTemplateModal,
  setOpenEditTemplateModal,
  templateToBeEdited,
  reFetch,
  senderData
}: any) => {
  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const client_id = parsedLCData?.id;

  const getSlectedSenderInfoQuery = useQuery({
    queryKey: ["get-selected-sender"],
    queryFn: async () => {
      const endpoint = `/templates/get-sender?client_id=${client_id}&template_id=${templateToBeEdited.id}&type=sms`;
      return await GET(endpoint);
    },
  });

  const senderInfo = getSlectedSenderInfoQuery.data?.data;

  const [type, setType] = useState("sms");
  const [languageCode, setLanguageCode] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [selectedUuid, setSelectedUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);

  useEffect(() => {
      const getAllCategories = async () => {
        const returnedData = await GET(`/categories/sms`, {
          headers: {
            'user-token': localStorage.getItem('token')
          }
        });

        const items: any = [];
        returnedData?.data.map((item: any) => {
          items.push({
            name: item.name,
            value: item.id
          })
        });

        setCategories(items);
    }

    getAllCategories()
  }, []);

  useEffect(() => {
    if (templateToBeEdited && senderInfo) {
      setType(templateToBeEdited.type || "");
      setLanguageCode(templateToBeEdited?.translations[0]?.language_code || "");
      setSelectedCategory(templateToBeEdited?.category_id || 0);
      setTemplateName(templateToBeEdited.template_name || "");
      setBody(templateToBeEdited?.translations[0]?.body || "");
      if (templateToBeEdited?.translations.length > 1) {
        setBodyAr(templateToBeEdited?.translations[1]?.body || "");
      }
      setSelectedUuid(senderInfo.uuid || "")
    }
  }, [templateToBeEdited, senderInfo, openEditTemplateModal]);

  const handleSaveTemplate = async () => {
    const payload = {
      type,
      template_name: templateName,
      category_id: selectedCategory,
      translations: [{ language_code: "en", subject, body, sender_id: selectedUuid }, { language_code: "ar", subject, body: bodyAr, sender_id: selectedUuid }],
    };

    try {
      const response = await PUT(
        `/templates/${templateToBeEdited.id}`,
        payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user-secret': localStorage.getItem('token')
          }
        }
      );
      if (response?.status === 200) {
        toast.success("Template Updated Successfully");
        setOpenEditTemplateModal(false);
        reFetch();
      }
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const labels = {
    language: "Language",
    templateType: "Template Type",
    templateName: "Template Name",
    subject: "Subject",
    templateContent: "Template Content",
    saveTemplate: "Save Template",
  };


  const handleChange = (event: any) => {
    setSelectedUuid(event.target.value);
  };

  const handleChangeCategory = (event: any) => {
    setSelectedCategory(event.target.value)
  }
  

  return (
    <Dialog
      open={openEditTemplateModal}
      onClose={() => setOpenEditTemplateModal(false)}
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          padding: "24px",
          // minWidth: isAboveMd ? "400px" : "auto",
          borderRadius: "12px",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenEditTemplateModal(false)}
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
          mt: 5,
          mb: 3,
          fontWeight: 600,
          direction: "ltr",
          textAlign: "center",
        }}
      >
        {"Edit Template"}
      </Typography>

      <Grid2 container spacing={2} key={templateToBeEdited.id}>
        <Grid2 xs={12} md={6}>
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              direction: "ltr",
              textAlign: "left",
            }}
          >
            {labels.templateType}
          </Typography>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
            disabled
          >
            <MenuItem value="sms">SMS</MenuItem>
          </Select>
        </Grid2>

        <Grid2 xs={12} md={6}>
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              direction: "ltr",
              textAlign: "left",
            }}
          >
            {labels.templateName}
          </Typography>

          <CustomTextfield
            label={labels.templateName}
            placeholder={"Enter template name"}
            value={templateName}
            onChange={(e: any) => setTemplateName(e.target.value)}
          />
        </Grid2>


        {senderData.length > 0 && <Grid2 xs={12}>
          <InputLabel id="sender-select-label">Select Sender</InputLabel>
          <Select
            labelId="sender-select-label"
            id="sender-select"
            value={selectedUuid}
            onChange={(event) => handleChange(event)}
            displayEmpty
            fullWidth
          >
            {loading ? (
              <MenuItem disabled>
                <CircularProgress size={24} />
              </MenuItem>
            ) : (
              senderData &&
              senderData.length &&
              senderData.map((sender: any) =>
                sender.locales.map((locale: any) => (
                  <MenuItem key={locale.uuid} value={sender.uuid}>
                    {locale.name}
                  </MenuItem>
                ))
              )
            )}
          </Select>
        </Grid2>}

        {categories.length > 0 && <Grid2 xs={12} mt={1}>
          <InputLabel id="category-label">Select Category</InputLabel>
          <Select
            labelId="category-label-id"
            id="category-label"
            value={selectedCategory ?? ""}
            onChange={(event) => handleChangeCategory(event)}
            displayEmpty
            fullWidth
          >
            <MenuItem value={0}>
              No Category
            </MenuItem>
            {loading ? (
              <MenuItem disabled>
                <CircularProgress size={24} />
              </MenuItem>
            ) : (
              categories &&
              categories.length &&
              categories.map((category: any) => {
                if (category.value) {
                  return (
                    <MenuItem key={category.value} value={category.value}>
                      {category.name}
                    </MenuItem>
                  )
                } else {
                  return null;
                }
              }
              )
            )}
          </Select>
        </Grid2>}

        <Grid2 xs={12} sx={{ mt: 2 }}>
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              direction: "ltr",
              textAlign: "left",
            }}
          >
            {labels.templateContent}
          </Typography>
          <ReactQuill theme="snow" value={body} onChange={setBody} />
        </Grid2>

        <Grid2 xs={12} sx={{ mt: 2 }}>
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              direction: "rtl",
              textAlign: "right",
            }}
          >
            محتوى القالب
          </Typography>
          <RichTextEditor value={bodyAr} setValue={setBodyAr} language={"ar"} />
        </Grid2>
      </Grid2>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveTemplate}
        >
          {labels.saveTemplate}
        </Button>
      </Box>
    </Dialog>
  );
};
