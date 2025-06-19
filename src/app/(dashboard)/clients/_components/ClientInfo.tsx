import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Typography,
  useTheme,
  Box,
  Button,
  IconButton,
  CircularProgress,
  TextField,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { GET } from "@/utils/AxiosUtility";
import EditClientModal from "./EditClientModal";
import { DeleteClientModal } from "./DeleteClientModal";
import RegenrateModal from "./SureityModal";

const ClientInfo = ({ clientInfo, reFetch }: any) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(clientInfo.token);
    toast.success("Secret Key Copied");
  };

  // #region for handle Client Info Modal

  const [openEditClientInfoModal, setOpenEditClientInfoModal] = useState(false);

  const [itemToBeEdited, setItemToBeEdited] = useState<any>(null);

  const handleOpenEditModal = (item: any) => {
    setOpenEditClientInfoModal(true);
    setItemToBeEdited(item);
  };

  // #endregion

  const handleRegenerateSecret = async (userId: number) => {
    setLoading(true);
    try {
      const response: any = await GET(
        `/client/regenerate-token?userId=${userId}`
      );

      if (response?.status === 200) {
        reFetch();
        toast.success("Secret Key Regenerated");
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to regenerate secret");
    } finally {
      setLoading(false);
    }
  };

  // #region for handle Delete Client

  const [openDeleteClientModal, setOpenDeleteClientModal] = useState(false);

  const [itemToBeDeleted, setItemToBeDeleted] = useState<any>(null);

  const handleDelete = async (clientInfo: any) => {
    setOpenDeleteClientModal(true);
    setItemToBeDeleted(clientInfo);
  };

  return (
    <Grid2 container>
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            gap: 1,
          }}
        >
          {/* delete Icon  */}
          <IconButton onClick={() => handleDelete(clientInfo)}>
            <DeleteIcon fontSize="small" />
          </IconButton>

          {/* Edit icon */}
          <IconButton onClick={() => handleOpenEditModal(clientInfo)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Grid2 xs={12} sx={{ mb: 1 }}>
        <Tooltip
          title={clientInfo.localeClients?.[0]?.contact_person_name || ""}
          arrow
        >
         <Typography
            variant="h3"
            color={theme.palette.primary.dark}
            textTransform="capitalize"
          >
            {clientInfo?.localeClients?.[0]?.contact_person_name &&
              (clientInfo.localeClients[0].contact_person_name.length > 15
                ? clientInfo.localeClients[0].contact_person_name.slice(0, 15) + "..."
                : clientInfo.localeClients[0].contact_person_name)}
          </Typography>

        </Tooltip>
      </Grid2>
      <Grid2 xs={12}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.grey[100],
            borderRadius: "20px",
            padding: "5px 16px",
            marginTop: "10px",
          }}
        >
          <Typography
            sx={{
              fontWeight: 400,
              color: "#757575",
              whiteSpace: "nowrap",
            }}
          >
            Secret Key:
          </Typography>

          <TextField
            variant="standard"
            value={clientInfo.token.slice(0, 22) + "..."}
            InputProps={{
              disableUnderline: true,
              style: {
                fontWeight: 400,
                color: "#757575",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                backgroundColor: "#F5F5F5",
                borderRadius: "30px",
                padding: "4px 8px",
              },
            }}
            sx={{
              flex: 1,
              "& input": {
                cursor: "default",
              },
            }}
            disabled
          />
          {/* Refresh Icon */}
          <IconButton
            size="small"
            onClick={() => setShowModal(true)}
            color="secondary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <AutorenewIcon fontSize="small" />
            )}
          </IconButton>

          {/* Copy Icon */}
          <IconButton size="small" onClick={handleCopy}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 3 }}>
        <ClientEmail clientInfo={clientInfo} />
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 3 }}>
        <ClientPhoneNo clientInfo={clientInfo} />
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          endIcon={<KeyboardArrowRightIcon />}
          onClick={() => {
            // set id in local
            localStorage.setItem("client-secret", clientInfo.token);
            localStorage.setItem(
              "client-name",
              clientInfo?.localeClients[0]?.contact_person_name
            );
            localStorage.setItem("client-info", JSON.stringify(clientInfo));
            window.location.pathname = "/templates";
          }}
        >
          Details
        </Button>
      </Grid2>

      {openEditClientInfoModal && (
        <EditClientModal
          itemToBeEdited={itemToBeEdited}
          openEditClientInfoModal={openEditClientInfoModal}
          setOpenEditClientInfoModal={setOpenEditClientInfoModal}
          reFetch={reFetch}
        />
      )}

      {/* Regenerate Secret Key Modal */}
      {showModal && (
        <RegenrateModal
          clientId={clientInfo.id}
          onClose={() => setShowModal(false)}
          handleRegenerateSecret={handleRegenerateSecret}
          isOpen={showModal}
        />
      )}

      {/* Delete Cleint Modal */}
      {openDeleteClientModal && (
        <DeleteClientModal
          itemToBeDeleted={itemToBeDeleted}
          openDeleteClientModal={openDeleteClientModal}
          setOpenDeleteClientModal={setOpenDeleteClientModal}
          reFetch={reFetch}
        />
      )}
    </Grid2>
  );
};

export default ClientInfo;

const ClientEmail = ({ clientInfo }: any) => {
  const theme = useTheme();
  return (
    <Grid2 container>
      {/* Invoices Status Text */}
      <Grid2 xs={6} md={6}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.palette.primary.dark,
            textTransform: "capitalize",
          }}
        >
          <b>Email:</b>
        </Typography>
      </Grid2>

      {/* Status Boxes */}
      <Grid2 xs={6} md={6} display="flex" justifyContent="flex-end">
        <Typography>
          <b>{clientInfo.contact_email}</b>
        </Typography>
      </Grid2>
    </Grid2>
  );
};

const ClientPhoneNo = ({ clientInfo }: any) => {
  const theme = useTheme();
  return (
    <Grid2 container>
      {/* Invoices Status Text */}
      <Grid2 xs={6} md={6}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.palette.primary.dark,
            textTransform: "capitalize",
          }}
        >
          <b>Phone No:</b>
        </Typography>
      </Grid2>

      {/* Status Boxes */}
      <Grid2 xs={6} md={6} display="flex" justifyContent="flex-end">
        <Typography>
          <b>
            {clientInfo.country_code} {clientInfo.contact_phone}
          </b>
        </Typography>
      </Grid2>
    </Grid2>
  );
};
