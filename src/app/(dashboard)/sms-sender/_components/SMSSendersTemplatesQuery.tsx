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

import { GET } from "@/utils/AxiosUtility";
import TableLoader from "@/components/loaders/TableLoader";
import NotFound from "@/components/errors/404";
import { useDebounce } from "use-debounce";
import { DeleteSenderModal } from "./Modals/DeleteSenderModal";
import CreateEmailSenderModal from "./CreateSMSSenderModal";
import { SingleSMSSender } from "./SingleSMSSender";
import { EditSMSSenderModal } from "./Modals/EditSMSSenderModal";

// component responsible for showing and creating sms sender in our system
export const SMSSendersTemplatesQuery = () => {
  const [search, setSearch] = useState("");

  const [debouncedSearch] = useDebounce(search, 500);
  useEffect(() => {
    reFetch();
  }, [debouncedSearch]);

  // #region general state
  const theme = useTheme();
  const [openCreateSender, setOpenCreateSender] = useState(false);

  // #endregion

  // #region for deleting sender

  // state to handle delete sender modal

  const [openDeleteSenderModal, setOpenDeleteSenderModal] = useState(false);
  const [senderToBeDeleted, setSenderToBeDeleted] = useState<any>({});

  const handleDeleteSender = (sender: any) => {
    setOpenDeleteSenderModal(true);
    setSenderToBeDeleted(sender);
  };

  // #endregion

  // #region for editing sender

  // state to handle edit sender modal
  const [openEditSenderModal, setOpenEditSenderModal] = useState(false);
  const [senderToBeEdited, setSenderToBeEdited] = useState<any>({});
  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const clientId = parsedLCData?.id;
  const handleEditSender = (sender: any) => {
    setOpenEditSenderModal(true);
    setSenderToBeEdited(sender);
  };

  // #endregion

  // The QueryClient can be used to interact with a cache. here we need it to refetch
  // again on edit and add and delete.
  const queryClient = useQueryClient();
  const reFetch = () => {
    // fetch again so UI update automatically.
    queryClient.refetchQueries({ queryKey: ["get-all-sms-senders"] });
  };

  const getAllSendersQuery = useQuery({
    queryKey: ["get-all-sms-senders"],
    queryFn: async () => {
      const endpoint =
        search.trim() !== "" && search !== ""
          ? `senders/search?query=${encodeURIComponent(
            search
          )}&clientId=${clientId}&type=sms`
          : `senders/all-sender/sms?clientId=${clientId}`;
      return await GET(endpoint, {
        headers: {
          "Content-Type": "application/json",
          "user-token": localStorage.getItem("token"),
        }
      });
    },
    retry: false
  });

  //#endregion

  if (getAllSendersQuery.isPending) return <TableLoader />;

  // @ts-ignore
  if (getAllSendersQuery?.error?.status === 401)
    return <h1 style={{ textAlign: "center" }}>You are Not Authorized to view this section.</h1>;

  if (getAllSendersQuery.error || getAllSendersQuery.data?.status === 404)
    return <NotFound />;

  const allSenders = getAllSendersQuery.data?.data;

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
              SMS Senders
              <Tooltip
                title="You can view a list of sms senders here."
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
              onClick={() => setOpenCreateSender(true)}
              sx={{
                transition: "0.3s",
                transform: "scale(1)",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                },
              }}
            >
              <b>Create Sender</b>
            </Button>
          </Box>
        </Grid2>
        <Grid2>
          <Alert style={{ fontSize: "14px" }}>
            Please ensure that any sender you register here is also registered
            in our SMS Gateways. Otherwise, the sender will not function
            correctly. <br /><strong>The sender will be created immediately but once you create a template using this sender. We will
            send a verification message to the sender&apos;s phone number to confirm that the sender in registered in our SMS Gateways.</strong>
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
            placeholder="Search By Sender Name"
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </Grid2>
        <Grid2 xs={8} />
        {allSenders.length === 0 && (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Typography variant="h2" sx={{ textAlign: "center" }}>
              No Sender found...
            </Typography>
          </Box>
        )}
        {allSenders?.map((sender: any) => {
          return (
            <SingleSMSSender
              sender={sender}
              handleEditSender={handleEditSender}
              handleDeleteSender={handleDeleteSender}
              reFetch={reFetch}
              key={sender?.id}
            />
          );
        })}
      </Grid2>

      {openCreateSender && (
        <CreateEmailSenderModal
          openCreateSender={openCreateSender}
          setOpenCreateSender={setOpenCreateSender}
          reFetch={reFetch}
        />
      )}

      {openDeleteSenderModal && (
        <DeleteSenderModal
          openDeleteSenderModal={openDeleteSenderModal}
          setOpenDeleteSenderModal={setOpenDeleteSenderModal}
          senderToBeDeleted={senderToBeDeleted}
          reFetch={reFetch}
        />
      )}

      {openEditSenderModal && (
        <EditSMSSenderModal
          openEditSenderModal={openEditSenderModal}
          setOpenEditSenderModal={setOpenEditSenderModal}
          senderToBeEdited={senderToBeEdited}
          reFetch={reFetch}
        />
      )}
    </>
  );
};
