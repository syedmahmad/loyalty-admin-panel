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
import EditCategoryModal from "./EditCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";

const CategoryInfo = ({ categoryInfo, reFetch }: any) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        `/categories/regenerate-token?userId=${userId}`
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

  const handleDelete = async (categoryInfo: any) => {
    setOpenDeleteClientModal(true);
    setItemToBeDeleted(categoryInfo);
  };

  return (
    <Grid2 container>

      <Grid2 xs={8} sx={{ mb: 1 }}>
        <Tooltip
          title={categoryInfo.name || ""}
          arrow
        >
         <Typography
            variant="h3"
            color={theme.palette.primary.dark}
            textTransform="capitalize"
          >
            {categoryInfo.name}
          </Typography>

        </Tooltip>
      </Grid2>
      <Grid2 xs={4} sx={{ mb: 1, display: "flex", justifyContent: "flex-end" }}>
          {/* delete Icon  */}
          <IconButton onClick={() => handleDelete(categoryInfo)}>
            <DeleteIcon fontSize="small" />
          </IconButton>

          {/* Edit icon */}
          <IconButton onClick={() => handleOpenEditModal(categoryInfo)}>
            <EditIcon fontSize="small" />
          </IconButton>
      </Grid2>
      <Grid2 xs={12} sx={{ mb: 1 }}>
         <Typography
            variant="body1"
            color={theme.palette.primary.dark}
            textTransform="capitalize"
          >
            Type: {categoryInfo.channel === "Sms" ? categoryInfo.channel?.toUpperCase() : categoryInfo.channel}
          </Typography>
      </Grid2>
      

      {openEditClientInfoModal && (
        <EditCategoryModal
          itemToBeEdited={itemToBeEdited}
          openEditClientInfoModal={openEditClientInfoModal}
          setOpenEditClientInfoModal={setOpenEditClientInfoModal}
          reFetch={reFetch}
        />
      )}

      {openDeleteClientModal && (
        <DeleteCategoryModal
          itemToBeDeleted={itemToBeDeleted}
          openDeleteClientModal={openDeleteClientModal}
          setOpenDeleteClientModal={setOpenDeleteClientModal}
          reFetch={reFetch}
        />
      )}
    </Grid2>
  );
};

export default CategoryInfo;

