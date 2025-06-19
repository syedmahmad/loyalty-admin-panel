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
  SelectChangeEvent,
  TextField,
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

export const EditWhatsAppTempLateModal = ({
  openEditTemplateModal,
  setOpenEditTemplateModal,
  templateToBeEdited,
  reFetch,
  senderData,
}: any) => {
  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const client_id = parsedLCData?.id;

  const getSlectedSenderInfoQuery = useQuery({
    queryKey: ["get-selected-sender"],
    queryFn: async () => {
      const endpoint = `/templates/get-sender?client_id=${client_id}&template_id=${templateToBeEdited.id}&type=whatsapp`;
      return await GET(endpoint);
    },
  });

  const senderInfo = getSlectedSenderInfoQuery.data?.data;

  const [type, setType] = useState("whatsapp");
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
        const returnedData = await GET(`/categories/whatsapp`, {
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
      setLanguageCode(templateToBeEdited?.template_name.includes("ar") ? templateToBeEdited?.translations[1]?.language_code : templateToBeEdited?.translations[0]?.language_code || "");
      setSelectedCategory(templateToBeEdited?.category_id || 0);
      setTemplateName(templateToBeEdited.template_name || "");
      setBody(templateToBeEdited?.translations[0]?.body || "");

      const headerEn = templateToBeEdited?.translations[0]?.header?.replace(
        /^"(.*)"$/,
        "$1"
      );
      if (templateToBeEdited?.translations.length > 1) {
        const header = templateToBeEdited?.translations[1]?.header?.replace(
          /^"(.*)"$/,
          "$1"
        );
        setBodyAr(templateToBeEdited?.translations[1]?.body || "");
      }
      setSelectedUuid(senderInfo.uuid || "");
    }
  }, [templateToBeEdited, senderInfo]);

  const handleSaveTemplate = async () => {
    const payload = {
      type,
      template_name: templateName,
      category_id: selectedCategory,
      translations: [
        {
          language_code: "en",
          subject,
          body: body,
          sender_id: selectedUuid,
        },
        {
          language_code: "ar",
          subject,
          body: body,
          sender_id: selectedUuid,
        },
      ],
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

  const handleChangeCategory = (event: any) => {
    setSelectedCategory(event.target.value)
  }

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

  return (
    <Dialog
      open={openEditTemplateModal}
      onClose={() => setOpenEditTemplateModal(false)}
      maxWidth="xs"
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
        {/* <Grid2 xs={12} md={6}>
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
        </Grid2> */}

        <Grid2 xs={12}>
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

        {/* {headerType === "1" && (
          <Grid2 xs={12} md={headerType === "1" ? 6 : 12}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              Header Text
            </Typography>
            <CustomTextfield
              label={"Header Text"}
              placeholder={"Enter Header Text"}
              lang={"en"}
              value={headerText.replace(/^"(.*)"$/, "$1")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setHeaderText(e.target.value)
              }
            />
          </Grid2>
        )} */}

        {/* <Grid2 xs={12}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "5px",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            Header
          </Typography>
          <Select
            value={headerType}
            fullWidth
            onChange={(e: SelectChangeEvent) => setHeaderType(e.target.value)}
          >
            <MenuItem value="0">None</MenuItem>
            <MenuItem value="1">Text</MenuItem>
          </Select>
        </Grid2> */}

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
            labelId="category-label"
            id="category-label"
            value={selectedCategory}
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
              categories.map((category: any) =>
                  <MenuItem key={category.value} value={category.value}>
                    {category.name}
                  </MenuItem>
              )
            )}
          </Select>
        </Grid2>}
        {/* header type */}
        <Grid2 xs={12}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "5px",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            Language
          </Typography>
          <Select
            value={languageCode}
            fullWidth
            onChange={(e: SelectChangeEvent) => setLanguageCode(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">Arabic</MenuItem>
          </Select>
        </Grid2>

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
          <TextField
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            rows={4}
            fullWidth
            placeholder="Enter template content"
            variant="outlined"
          />
          {/* <ReactQuill theme="snow" value={body} onChange={setBody} /> */}
        </Grid2>

        {/* footer */}
        {/* <Grid2 xs={12}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "5px",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            Footer
          </Typography>
          <CustomTextfield
            label={"Footer (Optional)"}
            placeholder={"Footer"}
            lang="en"
            value={footerText.replace(/^"(.*)"$/, "$1")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFooterText(e.target.value)
            }
          />
        </Grid2> */}

        {/* Arabic version of template here... */}

        {/* <Grid2 xs={12}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "5px",
              direction: "rtl",
              textAlign: "right",
            }}
          >
            رأس
          </Typography>
          <Select
            value={headerTypeAr}
            fullWidth
            onChange={(e: SelectChangeEvent) => setHeaderTypeAr(e.target.value)}
            dir="rtl"
          >
            <MenuItem value="0">لا أحد</MenuItem>
            <MenuItem value="1">نص</MenuItem>
          </Select>
        </Grid2>

        {headerTypeAr === "1" && (
          <Grid2 xs={12}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              نص الرأس
            </Typography>
            <CustomTextfield
              label={"نص الرأس"}
              placeholder={"أدخل نص الرأس"}
              lang="ar"
              value={headerTextAr.replace(/^"(.*)"$/, "$1")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setHeaderTextAr(e.target.value)
              }
            />
          </Grid2>
        )} */}

        {/* <Grid2 xs={12} sx={{ mt: 2 }}>
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
        </Grid2> */}

        {/* footer */}
        {/* <Grid2 xs={12}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "5px",
              direction: "rtl",
              textAlign: "right",
            }}
          >
            التذييل (اختياري)
          </Typography>

          <CustomTextfield
            label={"التذييل (اختياري)"}
            placeholder={"تذييل"}
            lang="ar"
            value={footerTextAr.replace(/^"(.*)"$/, "$1")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFooterTextAr(e.target.value)
            }
          />
        </Grid2> */}
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
