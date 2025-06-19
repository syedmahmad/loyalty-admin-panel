"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import {
  Button,
  Typography,
  useTheme,
  Tooltip,
  TextField,
  Alert,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TableLoader from "@/components/loaders/TableLoader";
import NotFound from "@/components/errors/404";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import { GET } from "@/utils/AxiosUtility";
import CreateWhatsAppTemplateModal from "./Modals/CreateTemplateModal";
import { SingleWhatsAppTemplate } from "./SingleWhatsAppTemplate";
import { DeleteTemplateModal } from "./Modals/DeleteTemplateModal";
import { ViewWhatsAppTempLateModal } from "./Modals/ViewTemplateModal";
import { EditWhatsAppTempLateModal } from "./Modals/EditTemplateModal";
import Link from "next/link";

export const WhatsappTemplateQuery = () => {
  const [search, setSearch] = useState("");

  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const client_id = parsedLCData?.id;

  const [debouncedSearch] = useDebounce(search, 500);
  useEffect(() => {
    reFetch();
  }, [debouncedSearch]);

  // #region general state
  const theme = useTheme();
  const [openCreateWhatsAppTemplate, setOpenCreateWhatsAppTemplate] =
    useState(false);

  // #endregion

  // #region for viewing template
  // state to handle view template modal
  const [openViewTemplateModal, setOpenViewTemplateModal] = useState(false);
  const [templateToBeViewed, setTemplateToBeViewed] = useState<any>({});

  const handeViewTemplate = (template: any) => {
    setOpenViewTemplateModal(true);
    setTemplateToBeViewed(template);
  };

  // #endregion

  // #region for deleting template

  // state to handle delete template modal

  const [openDeleteTemplateModal, setOpenDeleteTemplateModal] = useState(false);
  const [templateToBeDeleted, setTemplateToBeDeleted] = useState<any>({});

  const handleDeleteTemplate = (template: any) => {
    setOpenDeleteTemplateModal(true);
    setTemplateToBeDeleted(template);
  };

  // #endregion

  // #region for editing template

  // state to handle edit template modal
  const [openEditTemplateModal, setOpenEditTemplateModal] = useState(false);
  const [templateToBeEdited, setTemplateToBeEdited] = useState<any>({});

  const handleEditTemplate = (template: any) => {
    setOpenEditTemplateModal(true);
    setTemplateToBeEdited(template);
  };

  // #endregion

  // The QueryClient can be used to interact with a cache. here we need it to refetch
  // again on edit and add and delete.
  const queryClient = useQueryClient();
  const reFetch = () => {
    // fetch again so UI update automatically.
    queryClient.invalidateQueries({ queryKey: ["get-all-template-whatsapp"] });
  };

  const getSenderQuery = useQuery({
    queryKey: ["get-sender"],
    queryFn: async () => {
      const endpoint = `senders/all?clientId=${client_id}&type=whatsapp`;
      return await GET(endpoint);
    },
  });

  const senderData = getSenderQuery?.data?.data;

  const getAllTemplateQuery = useQuery({
    queryKey: ["get-all-template-whatsapp"],
    queryFn: async () => {
      const endpoint =
        search.trim() !== "" && search !== ""
          ? `/templates/whatsapp/${search}`
          : `/templates/all-whatsapp?client_id=${client_id}`;
      return await GET(endpoint, {
        headers: {
          'user-token': localStorage.getItem('token')
        }
      });
    },
    retry: false
  });

  //#endregion
  if (getAllTemplateQuery.isPending) return <TableLoader />;

  // @ts-ignore
  if (getAllTemplateQuery?.error?.status === 401)
    return <h1 style={{ textAlign: "center" }}>You are Not Authorized to view this section.</h1>;

  if (getAllTemplateQuery.error || getAllTemplateQuery.data?.status === 404)
    return <NotFound />;

  const allTemplates = getAllTemplateQuery.data?.data;

  const handleOpenCreateSMSTemplate = () => {
    if (senderData.length > 0) {
      setOpenCreateWhatsAppTemplate(true);
    } else {
      toast.warn(
        "You need to register a sender before creating a sms template",
        { autoClose: false }
      );
    }
  };

  return (
    <>
      <Grid2 container>
        <Grid2 xs={12}>
          <Box
            sx={{
              paddingBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h3"
              color={theme.palette.primary.dark}
              textTransform="capitalize"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              WhatsApp Templates
              <Tooltip
                title="You can create whatsApp templates to use in your campaigns."
                arrow
                placement="top"
              >
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 20,
                    cursor: "pointer",
                    color: theme.palette.primary.light,
                  }}
                />
              </Tooltip>
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenCreateSMSTemplate}
              sx={{
                transition: "0.3s",
                transform: "scale(1)",
                "&:hover": {
                  transform: "scale(1.05)", // Slightly enlarges on hover
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                },
              }}
            >
              <b>Create WhatsApp Template</b>
            </Button>
          </Box>
        </Grid2>
        <Grid2>
          <Alert style={{ fontSize: "14px" }}>
            You can copy templates data form{" "}
            <strong>
              Informin=&gt;Settings=&gt;Channels=&gt;GoGo Motor Toll
              Free=&gt;Manage Templates
            </strong>
            <br />
            <strong>NOTE:</strong>While duplicating, don't need to copy complete
            curl, only components section (array) is allowed. Make sure, don't
            copy exact same dummy links(i-e docs, video, images) here. If you do
            that, you are not able to create templates and get error from
            infromin.
            <br />
            If you wanted to include un-subsription link, follow this document <Link target="_blank" href="https://www.notion.so/d3da207b524d44ee9c4e900cf2e50822?p=21506a04fa62808fba3fc6b6a31981aa&showMoveTo=true" color="primary"> <strong>check</strong> </Link>
          </Alert>
          <br />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 xs={4}>
          <TextField
            variant="outlined"
            value={search}
            fullWidth
            placeholder="Search By Template Name"
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </Grid2>
        <Grid2 xs={8} />
        {allTemplates.length === 0 && (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Typography variant="h2" sx={{ textAlign: "center" }}>
              No template found...
            </Typography>
          </Box>
        )}
        {allTemplates.map((template: any) => {
          return (
            <SingleWhatsAppTemplate
              template={template}
              handeViewTemplate={handeViewTemplate}
              handleEditTemplate={handleEditTemplate}
              handleDeleteTemplate={handleDeleteTemplate}
              reFetch={reFetch}
              key={template?.id}
            />
          );
        })}
      </Grid2>

      {openCreateWhatsAppTemplate && (
        <CreateWhatsAppTemplateModal
          openCreateWhatsAppTemplate={openCreateWhatsAppTemplate}
          setOpenCreateWhatsAppTemplate={setOpenCreateWhatsAppTemplate}
          reFetch={reFetch}
        />
      )}

      {openViewTemplateModal && (
        <ViewWhatsAppTempLateModal
          openViewTemplateModal={openViewTemplateModal}
          setOpenViewTemplateModal={setOpenViewTemplateModal}
          templateToBeViewed={templateToBeViewed}
          reFetch={reFetch}
        />
      )}

      {openDeleteTemplateModal && (
        <DeleteTemplateModal
          openDeleteTemplateModal={openDeleteTemplateModal}
          setOpenDeleteTemplateModal={setOpenDeleteTemplateModal}
          templateToBeDeleted={templateToBeDeleted}
          reFetch={reFetch}
        />
      )}

      {openEditTemplateModal && (
        <EditWhatsAppTempLateModal
          openEditTemplateModal={openEditTemplateModal}
          setOpenEditTemplateModal={setOpenEditTemplateModal}
          templateToBeEdited={templateToBeEdited}
          reFetch={reFetch}
          senderData={senderData}
        />
      )}
    </>
  );
};
