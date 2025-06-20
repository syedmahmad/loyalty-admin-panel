import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Typography,
  useTheme,
  Box,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EditClientModal from "./EditClientModal";
import { DeleteClientModal } from "./DeleteClientModal";

const ClientInfo = ({ clientInfo, reFetch }: any) => {
  const theme = useTheme();

  // #region for handle Client Info Modal

  const [openEditClientInfoModal, setOpenEditClientInfoModal] = useState(false);

  const [itemToBeEdited, setItemToBeEdited] = useState<any>(null);

  const handleOpenEditModal = (item: any) => {
    setOpenEditClientInfoModal(true);
    setItemToBeEdited(item);
  };

  // #endregion

  // const handleRegenerateSecret = async (userId: number) => {
  //   setLoading(true);
  //   try {
  //     const response: any = await GET(
  //       `/client/regenerate-token?userId=${userId}`
  //     );

  //     if (response?.status === 200) {
  //       reFetch();
  //       toast.success("Secret Key Regenerated");
  //     } else {
  //       toast.error("Something went wrong.");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to regenerate secret");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
          title={clientInfo.name || ""}
          arrow
        >
         <Typography
            variant="h3"
            color={theme.palette.primary.dark}
            textTransform="capitalize"
          >
            {clientInfo?.name &&
              (clientInfo.name.length > 15
                ? clientInfo.name.slice(0, 15) + "..."
                : clientInfo.name)}
          </Typography>

        </Tooltip>
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 3 }}>
        <ClientDomain clientInfo={clientInfo} />
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          endIcon={<KeyboardArrowRightIcon />}
          onClick={() => {
            localStorage.setItem("client-info", JSON.stringify(clientInfo));
            window.location.pathname = "/dashboard";
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

const ClientDomain = ({ clientInfo }: any) => {
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
          <b>Domain:</b>
        </Typography>
      </Grid2>

      {/* Status Boxes */}
      <Grid2 xs={6} md={6} display="flex" justifyContent="flex-end">
        <Typography>
          <b>{clientInfo.domain}</b>
        </Typography>
      </Grid2>
    </Grid2>
  );
};
