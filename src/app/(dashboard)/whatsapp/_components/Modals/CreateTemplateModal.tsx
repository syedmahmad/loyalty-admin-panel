import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
  Button,
  Tooltip,
  InputLabel,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material";
import * as yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import Grid2 from "@mui/material/Unstable_Grid2";
import { CustomTextfield } from "@/components/CustomTextField";
import { GET, PATCH, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/components/errors/404";
import { RichTextEditor } from "../RichTextEditor";
import OtpModal from "./VerifyOTPModal";

interface CreateWhatsAppTemplateModalProps {
  openCreateWhatsAppTemplate: boolean;
  setOpenCreateWhatsAppTemplate: React.Dispatch<React.SetStateAction<boolean>>;
  reFetch: any;
}

const CreateWhatsAppTemplateModal = ({
  openCreateWhatsAppTemplate,
  setOpenCreateWhatsAppTemplate,
  reFetch,
}: CreateWhatsAppTemplateModalProps) => {
  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const client_id = parsedLCData?.id;

  const getSenderQuery = useQuery({
    queryKey: ["get-sender"],
    queryFn: async () => {
      const endpoint = `senders/all-sender/whatsapp?clientId=${client_id}&type=whatsapp`;
      return await GET(endpoint, {
        headers: {
          'user-token': localStorage.getItem('token')
        }
      });
    },
  });

  const [selectedUuid, setSelectedUuid] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event: any) => {
    setSelectedUuid(event.target.value);
  };

  const [language, setLanguage] = useState<string>("en");
  const [templateType, setTemplateType] = useState<string>("whatsapp");
  const [templateName, setTemplateName] = useState<string>("");
  const [value, setValue] = useState("");
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [languageCode, setLanguageCode] = useState("en");
  const [enableBulk, setEnableBulk] = useState<boolean>(false);

  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);

  useEffect(() => {
    const getAllCategories = async () => {
        const returnedData = await GET(`/categories/whatsapp`, {
          headers: {
            'user-token': localStorage.getItem('token')
          }
        });

        console.log("returnedData", returnedData);

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

  const templateSchema = yup.object().shape({
    language: yup.string().required("Language is required"),
    templateType: yup.string().required("Template type is required"),
    templateName: yup.string().required("Template name is required"),
    body: yup.string().required("Template content is required"),
    sender_id: yup.string().required("Sender is required"),
  });

  const handleSave = async () => {
    setSaveLoading(true);
    const lcData: any = localStorage.getItem("client-info");
    const parsedLCData = lcData && JSON.parse(lcData);
    const client_id = parsedLCData?.id;
    const payload = {
      type: templateType,
      client_id: client_id,
      sender_id: selectedUuid,
      template_name: templateName,
      category_id: selectedCategory,
      active: false,
      translations: [
        {
          language_code: "en",
          template_name: templateName,
          subject: "",
          body: value,
          bulk_enabled: enableBulk,
        },
        {
          language_code: "ar",
          template_name: templateName,
          subject: "",
          body: value,
          bulk_enabled: enableBulk,
        },
      ],
    };

    try {
      await templateSchema.validate(
        {
          language,
          templateType,
          templateName,
          body: value,
          sender_id: selectedUuid,
        },
        { abortEarly: false }
      );

      const bodyContent = {
        language_code: languageCode,
        template_name: templateName,
        components: value,
        sender_id: selectedUuid,
      };
      try {
        const dummyValidityCheckCall = await POST("/dispatch-whatsapp/dummy-whatsapp", bodyContent)

        console.log("dummyValidityCheckCall", dummyValidityCheckCall);
        if (dummyValidityCheckCall?.status === 201) {
          const response = await POST("templates/create", payload, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'user-secret': localStorage.getItem('token')
            }
          });
          if (response?.status === 201) {
            const payload = { active: true };
            await PATCH(`/templates/${response?.data?.id}`, payload, {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'user-secret': localStorage.getItem('token')
              }
            });
            toast.success("Template Created Successfully");
            reFetch();
            setOpenCreateWhatsAppTemplate(!openCreateWhatsAppTemplate);
            // setOpenOtpModal(true)
            // setTemplateId(response?.data.id);

            // try {
            //   const localStorgae = typeof window !== 'undefined' ? window.localStorage : null;
            //   const userDetails = JSON.parse(localStorgae?.getItem('user')!);
            //   await POST("templates/send-otp", { templateId: response?.data.id, user_email: userDetails.email }, {
            //     headers: {
            //       'Content-Type': 'application/json',
            //       'Authorization': `Bearer ${localStorage.getItem('client-secret')}`,
            //     },
            //   });
            // } catch {
            //   toast.error("Error sending OTP. Please try again.");
            // }
            
          } else {
            toast.error("This Template is not valid");
          }
        } else {
          toast.error("There is something wrong with the template, Please check the template and try again.");
        }

      } catch (error) {
        toast.error("This Template is not valid");
      }

    } catch (err: any) {
      if (err?.inner?.length) {
        err.inner.forEach((validationError: any) => {
          toast.error(validationError.message);
        });
      } else {
        toast.error("Something went wrong, please try again.");
      }
    }

    setSaveLoading(false);
  };

  const handleChangeCategory = (event: any) => {
    setSelectedCategory(event.target.value)
  }

  if (getSenderQuery.error || getSenderQuery.data?.status === 404)
    return <NotFound />;

  const senderData = getSenderQuery?.data?.data;

  return (
    <Dialog
      open={openCreateWhatsAppTemplate}
      onClose={() => setOpenCreateWhatsAppTemplate(false)}
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
        },
      }}
    >
      <Box sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenCreateWhatsAppTemplate(false)}
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
          {"Create Template"}
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
              {"Template Name"}
            </Typography>
            <CustomTextfield
              label={"Template Name"}
              placeholder={"Enter template name"}
              lang={language}
              value={templateName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTemplateName(e.target.value)
              }
            />
          </Grid2>

          {/* <Grid2 xs={12} md={6}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              {"Set as Default Template"}
            </Typography>
            <Select
              value={active ? "true" : "false"}
              fullWidth
              onChange={(e: SelectChangeEvent) =>
                setActive(e.target.value === "true")
              }
            >
              <MenuItem value="true">{"Active"}</MenuItem>
              <MenuItem value="false">{"Inactive"}</MenuItem>
            </Select>
          </Grid2> */}

          <Grid2 xs={6} md={6}>
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

          <Grid2 xs={12} mt={1}>
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
          </Grid2>

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

          {/* {headerType === "1" ? (
            <Grid2 xs={12}>
              <CustomTextfield
                label={"Header Text"}
                placeholder={"Enter Header Text"}
                lang={headerText}
                value={headerText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHeaderText(e.target.value)
                }
              />
            </Grid2>
          ) : null} */}

          <Grid2 xs={12} sx={{ marginTop: "20px" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: "5px",
                direction: "ltr",
                textAlign: "left",
              }}
            >
              Components{" "}
            </Typography>
            <TextField
              value={value}
              onChange={(e) => setValue(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Enter template content"
              variant="outlined"
            />
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
              Footer (Optional)
            </Typography>
            <CustomTextfield
              label={"Footer (Optional)"}
              placeholder={"Footer"}
              lang={footerText}
              value={footerText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFooterText(e.target.value)
              }
            />
          </Grid2> */}
          {/* ############################# */}
          {/* template arabic version  */}
          {/* ############################# */}

          {/* header type */}
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
              dir="rtl"
              sx={{ textAlign: "right" }}
              fullWidth
              onChange={(e: SelectChangeEvent) =>
                setHeaderTypeAr(e.target.value)
              }
            >
              <MenuItem value="0">لا أحد</MenuItem>
              <MenuItem value="1">نص</MenuItem>
            </Select>
          </Grid2>
          {headerTypeAr === "1" ? (
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
                value={headerTextAr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHeaderTextAr(e.target.value)
                }
              />
            </Grid2>
          ) : null} */}

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
              value={footerTextAr}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFooterTextAr(e.target.value)
              }
            />
          </Grid2> */}
          <Grid2 xs={12} display="flex" justifyContent="center">
            <Button disabled={saveLoading} variant="contained" color="primary" onClick={handleSave}>
              {"Save"}
            </Button>
          </Grid2>
          <OtpModal open={openOtpModal} onClose={() => setOpenOtpModal(false)} templateId={templateId} setOpenCreateSender={setOpenCreateWhatsAppTemplate} reFetch={reFetch} />
        </Grid2>
      </Box>
    </Dialog>
  );
};

export default CreateWhatsAppTemplateModal;
