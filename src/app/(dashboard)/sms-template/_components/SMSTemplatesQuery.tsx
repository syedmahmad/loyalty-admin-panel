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

import CreateTemplateModal from "./CreateTemplateModal";
import { ViewTempLateModal } from "./Modals/ViewTemplateModal";
import { DeleteTemplateModal } from "./Modals/DeleteTemplateModal";
import { EditTempLateModal } from "./Modals/EditTemplateModal";
import { GET } from "@/utils/AxiosUtility";
import TableLoader from "@/components/loaders/TableLoader";
import NotFound from "@/components/errors/404";
import { useDebounce } from "use-debounce";
import { SingleTemplate } from "./SingleTemplate";
import { toast } from "react-toastify";

export const SMSTemplatesQuery = () => {
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
  const [openCreateEmailTemplate, setOpenCreateEmailTemplate] = useState(false);

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
    queryClient.invalidateQueries({ queryKey: ["get-all-template-sms"] });
  };


  const getSenderQuery = useQuery({
    queryKey: ["get-sender"],
    queryFn: async () => {
      const endpoint = `senders/all-sender/sms?clientId=${client_id}`;
      return await GET(endpoint, {
        headers: {
          "Content-Type": "application/json",
          "user-token": localStorage.getItem("token"),
        }
      });
    },
  });

  const senderData = getSenderQuery?.data?.data;

  const getAllTemplateQuery = useQuery({
    queryKey: ["get-all-template-sms"],
    queryFn: async () => {
      const endpoint =
        search.trim() !== "" && search !== ""
          ? `/templates/sms/${search}`
          : `/templates/all-sms?client_id=${client_id}`;
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
      setOpenCreateEmailTemplate(true);
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
              SMS Templates
              <Tooltip
                title="You can create sms templates to use in your campaigns."
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
              <b>Create SMS Template</b>
            </Button>
          </Box>
        </Grid2>
        <Grid2>
          <Alert style={{ fontSize: '14px' }}>There are some key considerations when creating an SMS template. Ensure that both the <strong>sender</strong> and the <strong>template</strong> also exist in our Gateway; otherwise, SMS messages using these templates cannot be sent. Additionally, newly created templates will remain inactive until they are verified. Once the verification is complete and the templates are deemed valid, they will become active and ready for use.</Alert>
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
            <SingleTemplate
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

      {openCreateEmailTemplate && (
        <CreateTemplateModal
          openCreateEmailTemplate={openCreateEmailTemplate}
          setOpenCreateEmailTemplate={setOpenCreateEmailTemplate}
          reFetch={reFetch}
        />
      )}

      {openViewTemplateModal && (
        <ViewTempLateModal
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
        <EditTempLateModal
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
