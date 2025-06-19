import React, { useEffect, useState } from "react";
import Switch from "@mui/material/Switch";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Card,
  CardActions,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Button,
  Stack,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GET, PATCH, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { VersionHistoryModal } from "./Modals/VersionHistoryModalForSMS";
import { HowToUseTemplateModal } from "./Modals/HowToUseTemplateModal";
import VerifyOtpModal from "./Modals/VerifyOTP";

export const SingleTemplate = ({
  template,
  handeViewTemplate,
  handleEditTemplate,
  handleDeleteTemplate,
  reFetch,
}: any) => {
  const [isActive, setIsActive] = useState(template?.active || false);
  const [enableBulk, setEnableBulk] = useState(template?.translations[0]?.bulk_enabled || false);

  const [openVersionHistoryModal, setOpenVersionHistoryModal] = useState(false);
  const [versionHistoryData, setVersionHistoryData] = useState<any>([]);

  const [openHowToUseTemplateModal, setOpenHowToUseTemplateModal] =
    useState<boolean>(false);

  const [templateToBeUsed, setTemplateToBeUsed] = useState(template);

  const handleOpenHowToUseTemplateModal = () => {
    if (template) {
      setOpenHowToUseTemplateModal(true);
      setTemplateToBeUsed(template);
    } else {
      toast.warn("Something went wront, try reloading the page.");
    }
  };

  useEffect(() => {
    if (template) {
      setIsActive(template?.active);
      setEnableBulk(template?.translations[0]?.bulk_enabled);
    }
  }, [template]);

  const isArabic = template.translations[0]?.language_code === "ar";

  const extractDynamicFields = (template: string): Record<string, string> => {
    const regex = /{{\s*[\w_]+\s*}}/g;
    const matches = template.match(regex);
    const fields = matches ? matches.map((m) => m.replace(/{{\s*|\s*}}/g, "")) : [];
    
    const result: Record<string, string> = {};
    fields.forEach(field => {
      result[field] = `dummy_${field}`;
    });
  
    return result;
  };

  const toggleActiveStatus = async () => {
    const localStorgae = typeof window !== 'undefined' ? window.localStorage : null;
    const userDetails = JSON.parse(localStorgae?.getItem('user')!);
    if (!isActive) {
          try {
            const dummyDynamicFields = extractDynamicFields(template.translations[0].body);
            const bodyContent = {
              template_id: template.uuid,
              language_code: 'en',
              to: [{
                dynamic_fields: dummyDynamicFields
              }]
            }
    
            try {
              const clientToken = localStorgae?.getItem('client-secret');
              const res = await POST("/dispatch-message/dummy", bodyContent, {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${clientToken}`
                }
              });

              if (res?.status === 201) {
                toast.success("We're verfifying this template this may take some time. Please wait. You will be notified via email once it's done.");
              } else {
                toast.error("There is something wrong with the template, Please check the template and try again.");
              }
          } catch (error) {
            toast.error("Verification failed. Please make sure, it should be verified, otherwise you are not able to use this to send SMS.");
          }
          } catch {
            toast.error("Error Verifying Template. Please try again.");
          }
        } else {
          const payload = { active: false };
          const resp = await PATCH(`/templates/${template.id}`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'user-secret': localStorage.getItem('token')
            }
          });
          if (resp?.status === 200) {
            toast.success(`Template is now inactive`);
          }
        }
    
        reFetch();
  };

  const toggleBulkStatus = async () => {
    const newStatus = !enableBulk;
    setEnableBulk(newStatus);

    const payload = { bulk_enabled: newStatus };
    let resp: any = null;
    for (const item of template.translations) {
      try {
        await PATCH(`/templates/enable-bulk/${item.id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user-secret': localStorage.getItem('token')
          }
        });
      } catch (error) {
        toast.error("Something went wrong. Try again");
        setEnableBulk(!newStatus);
        break; // Stop further requests
      }
    }
    
    toast.success(`${template.template_name} is now ${newStatus ? "enabled" : "disabled"} for bulk upload using csv`);
    reFetch();
  };

  if (!template) {
    return <Typography>No Template Found...</Typography>;
  }

  const handleViewVersionHistory = async () => {
    const versionHistoryResponse = await GET(
      `version-history/template-history?id=${template.id}&localeId=${template.translations[0].id}`
    );
    if (versionHistoryResponse?.status === 200) {
      // opening the modal and passing the data to it
      setOpenVersionHistoryModal(true);
      setVersionHistoryData(versionHistoryResponse?.data);
    } else {
      toast.error(
        isArabic
          ? "حدث خطأ ما. حاول مرة أخرى"
          : "Something went wrong. Try again"
      );
    }
  };

  return (
    <>
      <Grid2 xs={12} sm={6} md={4} key={template?.id} marginTop={2}>
        <Card
          sx={{
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            transition: "0.3s",
            position: "relative",
            backgroundColor: isActive ? "rgb(249, 233, 249)" : "white",
            "&:hover": {
              boxShadow: "0px 6px 15px rgba(0,0,0,0.2)",
            },
          }}
        >
          <IconButton
            color="default"
            sx={{ position: "absolute", top: 10, right: 10 }}
            onClick={handleViewVersionHistory}
          >
            <Tooltip
              title="Click to view the version history. You can revert to any previous version at any time."
              arrow
              placement="top"
            >
              <HistoryIcon />
            </Tooltip>
          </IconButton>

          <CardContent>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                direction: isArabic ? "rtl" : "ltr",
                textAlign: isArabic ? "right" : "left",
              }}
            >
              {isArabic ? "اسم" : "Name"}: {template?.template_name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                direction: isArabic ? "rtl" : "ltr",
                textAlign: isArabic ? "right" : "left",
              }}
            >
              {isArabic ? "لغة" : "Language"}:{" "}
              {template?.translations[0]?.language_code === "ar"
                ? "عربي"
                : "English"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textTransform: "capitalize",
                direction: isArabic ? "rtl" : "ltr",
                textAlign: isArabic ? "right" : "left",
              }}
            >
              {isArabic
                ? template?.type === "email"
                  ? "بريد إلكتروني"
                  : "رسالة نصية"
                : template?.type === "email"
                ? "Email"
                : "SMS"}
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{ flexDirection: isArabic ? "row-reverse" : "row" }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{
                  direction: isArabic ? "rtl" : "ltr",
                  textAlign: isArabic ? "right" : "left",
                }}
              >
                {isArabic ? "نشط:" : `Active:`}
              </Typography>
              <Switch
                checked={isActive}
                onChange={toggleActiveStatus}
                color="primary"
                sx={{
                  marginLeft: isArabic ? 0 : 1,
                  marginRight: isArabic ? 1 : 0,
                  transform: "scale(0.8)",
                }}
              />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{ flexDirection: isArabic ? "row-reverse" : "row" }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{
                  direction: isArabic ? "rtl" : "ltr",
                  textAlign: isArabic ? "right" : "left",
                }}
              >
                {"Enable For Bulk Via CSV Upload:"}
              </Typography>
              <Switch
                checked={enableBulk}
                onChange={toggleBulkStatus}
                color="primary"
                sx={{
                  marginLeft: isArabic ? 0 : 1,
                  marginRight: isArabic ? 1 : 0,
                  transform: "scale(0.8)",
                }}
              />
            </Box>
          </CardContent>
          {/* {!template.active ? <ActionButtons refetch={reFetch} template={template} extractDynamicFields={extractDynamicFields} /> : <PlaceholderBox />} */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              color="primary"
              variant="outlined"
              endIcon={<HelpOutlineIcon />}
              onClick={handleOpenHowToUseTemplateModal}
              sx={{
                height: "30px",
                width: "130px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              How to use
            </Button>

            <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                color="primary"
                onClick={() => handeViewTemplate(template)}
              >
                <VisibilityIcon />
              </IconButton>
              <IconButton
                color="warning"
                onClick={() => handleEditTemplate(template)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDeleteTemplate(template)}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Box>
        </Card>
      </Grid2>

      {openVersionHistoryModal && (
        <VersionHistoryModal
          openVersionHistoryModal={openVersionHistoryModal}
          setOpenVersionHistoryModal={setOpenVersionHistoryModal}
          versionHistoryData={versionHistoryData}
          reFetch={reFetch}
        />
      )}

      {openHowToUseTemplateModal && (
        <HowToUseTemplateModal
          openHowToUseTemplateModal={openHowToUseTemplateModal}
          setOpenHowToUseTemplateModal={setOpenHowToUseTemplateModal}
          templateToBeUsed={templateToBeUsed}
        />
      )}
    </>
  );
};


// function ActionButtons({refetch, template, extractDynamicFields}: any) {
//   const [openVerifyModal, setOpenVerifyModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const handleReSendOtp = async () => {
//     setLoading(true);
//     // Logic to re-send OTP
//     try {
//       const localStorgae = typeof window !== 'undefined' ? window.localStorage : null;
//       const userDetails = JSON.parse(localStorgae?.getItem('user')!);
//       await POST("templates/send-otp", { templateId: template.id, user_email: userDetails.email! }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('client-secret')}`,
//         },
//       });
//       toast.success("OTP sent successfully!");
//       const dummyDynamicFields = extractDynamicFields(template.translations[0].body);
//       const bodyContent = {
//         template_id: template.uuid,
//         language_code: 'en',
//         to: [{
//           dynamic_fields: dummyDynamicFields
//         }]
//       }

//       try {
//         const clientToken = localStorgae?.getItem('client-secret');
//         await POST("/dispatch-message/dummy", bodyContent, {
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${clientToken}`
//           }
//         })
//       } catch (error) {
//         toast.error("This Template is not valid");
//       }
//       setLoading(false);
//     } catch {
//       toast.error("Error sending OTP. Please try again.");
//       setLoading(false);
//     }
//   }
//   return (
//     <>
//     <Typography
//       variant="body1"
//       component="span"
//       sx={{
//         direction: "ltr",
//         textAlign: "left",
//       }}
//     >
//       ℹ️ To make this template active, please verify OTP which is send to selected sender email.
//     </Typography>
//     <Stack direction="row" spacing={2} mt={1}>
//       <Button disabled={loading} variant="contained" size="small" color="primary" onClick={handleReSendOtp}>
//         {!loading ? 'Re-Send OTP' : 'Sending...'}
//       </Button>
//       <Button variant="outlined" size="small" color="secondary" onClick={() => setOpenVerifyModal(true)}>
//         Verify OTP
//       </Button>

//       <VerifyOtpModal
//         open={openVerifyModal}
//         onClose={() => setOpenVerifyModal(false)}
//         templateId={template.id} // Replace with actual senderId
//         onVerified={() => {
//           refetch();
//           setOpenVerifyModal(false);
//         }}
//       />
//     </Stack>
//     </>
//   );
// }

// function PlaceholderBox() {
//   return (
//     <Stack direction="row" spacing={1}>
//       <Box
//         sx={{
//           height: 60,         // same as small button height
//           minWidth: 160,      // adjust based on button group width
//           borderRadius: 1,
//         }}
//       />
//     </Stack>
//   );
// }