import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
  Button,
  Tooltip,
  CircularProgress,
  InputLabel,
  Card,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid2 from "@mui/material/Unstable_Grid2";
import { CustomTextfield } from "@/components/CustomTextField";
import { RichTextEditor, RichTextEditorAr } from "./RichTextEditor";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/components/errors/404";
import OtpModal from "./Modals/VerifyOTPModal";
import Visibility from "@mui/icons-material/Visibility";
import { ViewTemplateWhileCreating } from "./Modals/ViewTemplateWhileCreating";

interface CreateTemplateModalProps {
  openCreateEmailTemplate: boolean;
  setOpenCreateEmailTemplate: React.Dispatch<React.SetStateAction<boolean>>;
  reFetch: any;
}

const CreateTemplateModal = ({
  openCreateEmailTemplate,
  setOpenCreateEmailTemplate,
  reFetch,
}: CreateTemplateModalProps) => {
  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const client_id = parsedLCData?.id;

  const getSenderQuery = useQuery({
    queryKey: ["get-sender"],
    queryFn: async () => {
      const endpoint = `senders/all?clientId=${client_id}&type=email`;
      return await GET(endpoint);
    },
  });

  const senderData = getSenderQuery?.data?.data;

  const [templateName, setTemplateName] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [subjectAr, setSubjectAr] = useState<string>("");
  const [value, setValue] = useState("");
  const [valueAr, setValueAr] = useState("");
  const [enableBulk, setEnableBulk] = useState<boolean>(false);

  const [selectedUuid, setSelectedUuid] = useState("");
  const [loading, setLoading] = useState(false);

  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);

  useEffect(() => {
    const getAllCategories = async () => {
      const returnedData = await GET(`/categories/email`, {
        headers: {
          "user-token": localStorage.getItem("token"),
        },
      });

      console.log("returnedData", returnedData);

      const items: any = [];
      returnedData?.data.map((item: any) => {
        items.push({
          name: item.name,
          value: item.id,
        });
      });

      setCategories(items);
    };

    getAllCategories();
  }, []);

  const handleChange = (event: any) => {
    setSelectedUuid(event.target.value);
  };

  const handleSave = async () => {
    const lcData: any = localStorage.getItem("client-info");
    const parsedLCData = lcData && JSON.parse(lcData);
    const client_id = parsedLCData?.id;
    const payload = {
      type: "email",
      template_name: templateName,
      active: false,
      client_id: client_id,
      sender_id: selectedUuid,
      category_id: selectedCategory,
      translations: [
        {
          language_code: "en",
          template_name: templateName,
          subject: subject,
          body: value,
          bulk_enabled: enableBulk,
        },
        {
          language_code: "ar",
          template_name: templateName,
          subject: subjectAr,
          body: valueAr,
          bulk_enabled: enableBulk,
        },
      ],
    };

    try {
      const response = await POST("templates/create", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "user-secret": localStorage.getItem("token"),
        },
      });
      if (response?.status === 201) {
        toast.success("Template Created Successfully");
        reFetch();
        setOpenCreateEmailTemplate(!openCreateEmailTemplate);
        // setOpenOtpModal(true);
        // setTemplateId(response?.data.id);
        // const localStorgae = typeof window !== 'undefined' ? window.localStorage : null;
        // const userDetails = JSON.parse(localStorgae?.getItem('user')!);

        // try {
        //   await POST(
        //     "templates/send-otp",
        //     { templateId: response?.data.id, user_email: userDetails.email! },
        //     {
        //       headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${localStorage.getItem(
        //           "client-secret"
        //         )}`,
        //       },
        //     }
        //   );
        // } catch {
        //   toast.error("Error sending OTP. Please try again.");
        // }
      }
    } catch (e: any) {
      toast.error("Something Went Wront, Try reloading the page.");
    }
  };

  if (getSenderQuery.error || getSenderQuery.data?.status === 404)
    return <NotFound />;

  const [showPreview, setShowPreview] = useState(false);

  const [
    openViewTemplateModalWhileCreate,
    setOpenViewTemplateModalWhileCreate,
  ] = useState(false);

  const handleChangeCategory = (event: any) => {
    setSelectedCategory(event.target.value);
  };

  const templateToBeViewed = React.useMemo(
    () => ({
      id: 1,
      template_name: templateName,
      // active,
      enableBulk,
      translations: [
        { language_code: "en", subject, body: value },
        { language_code: "ar", subject: subjectAr, body: valueAr },
      ],
    }),
    [templateName, value, subject, subjectAr, valueAr, enableBulk]
  );

  const handlePreivew = () => {
    setShowPreview(true);
    setOpenViewTemplateModalWhileCreate(true);
  };

  return (
    <>
      <Box sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenCreateEmailTemplate(false)}
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

      <Box
        sx={{
          height: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h3"
          sx={{ marginBottom: "20px", textAlign: "center" }}
        >
          Create Template
          <Tooltip
            title={
              "While Creating template please add {{name}} {{any dynamic data}}  for adding text to replace it when using specific template "
            }
            placement="right"
            arrow
          >
            <IconButton>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        {/* </Grid2> */}

        {/* <Grid2 xs={6} md={6}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              Set as Default Template
            </Typography>
            <Select
              value={active ? "true" : "false"}
              fullWidth
              onChange={(e: SelectChangeEvent) =>
                setActive(e.target.value === "true")
              }
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </Grid2> */}
        <Grid2 container spacing={2}>
          <Grid2 xs={12} md={6}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              Template Name
            </Typography>
            <CustomTextfield
              label={"Template Name"}
              placeholder={"Enter template name"}
              lang={"en"}
              value={templateName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTemplateName(e.target.value)
              }
            />
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              Enable bulk upload
            </Typography>
            <Select
              value={enableBulk ? "true" : "false"}
              fullWidth
              onChange={(e: SelectChangeEvent) =>
                setEnableBulk(e.target.value === "true")
              }
            >
              <MenuItem value="true">Enable</MenuItem>
              <MenuItem value="false">Disable</MenuItem>
            </Select>
          </Grid2>

          <Grid2 xs={12}>
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
                      {locale.sender_email}
                    </MenuItem>
                  ))
                )
              )}
            </Select>
          </Grid2>

          <Grid2 xs={12} mt={1}>
            <InputLabel id="category-label">Select Category</InputLabel>
            <Select
              labelId="category-label"
              id="category-label"
              value={selectedCategory}
              onChange={(event) => handleChangeCategory(event)}
              displayEmpty
              fullWidth
            >
              <MenuItem value={0}>No Category</MenuItem>
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : (
                categories &&
                categories.length &&
                categories.map((category: any) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </Grid2>

          <Grid2 xs={12} md={6}>
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

            <CustomTextfield label={"Language"} lang={"en"} value={"English"} />
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              Subject
            </Typography>

            <CustomTextfield
              label={"Subject"}
              placeholder={"Enter Subject"}
              lang={"en"}
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubject(e.target.value)
              }
            />
          </Grid2>

          <Grid2 xs={12}>
            <Card
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                backgroundColor: "background.paper",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Template Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    See how your template will appear on mobile and desktop.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="medium"
                  endIcon={<Visibility sx={{ ml: 0.5 }} />}
                  sx={{
                    bgcolor: "primary.main",
                    whiteSpace: "nowrap",
                  }}
                  onClick={handlePreivew}
                  disabled={!templateName || !subject || !value}
                >
                  Preview Template
                </Button>
              </Box>
            </Card>
          </Grid2>

          <Grid2 xs={12} sx={{ marginTop: "20px" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              Template Content
            </Typography>
            <RichTextEditor value={value} setValue={setValue} language="en" />
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              لغة
            </Typography>

            <CustomTextfield label={"لغة"} lang={"ar"} value={"عربي"} />
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              موضوع
            </Typography>

            <CustomTextfield
              label={"موضوع"}
              placeholder={"أدخل الموضوع"}
              lang={"ar"}
              value={subjectAr}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubjectAr(e.target.value)
              }
            />
          </Grid2>

          <Grid2 xs={12} sx={{ marginTop: "20px" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              محتوى القالب
            </Typography>
            <RichTextEditorAr
              value={valueAr}
              setValueAr={setValueAr}
              language={"ar"}
            />
          </Grid2>

          <Grid2 xs={12} display={"flex"} justifyContent="center">
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Grid2>

          <OtpModal
            open={openOtpModal}
            onClose={() => setOpenOtpModal(false)}
            templateId={templateId}
            setOpenCreateSender={setOpenCreateEmailTemplate}
            reFetch={reFetch}
          />
        </Grid2>
      </Box>

      {showPreview && (
        <ViewTemplateWhileCreating
          templateToBeViewed={templateToBeViewed}
          openViewTemplateModalWhileCreate={openViewTemplateModalWhileCreate}
          setOpenViewTemplateModalWhileCreate={
            setOpenViewTemplateModalWhileCreate
          }
        />
      )}
    </>
  );
};

export default CreateTemplateModal;
