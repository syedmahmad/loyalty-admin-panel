import { Box, Dialog, IconButton, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import { toast } from "react-toastify";
import { DELETE } from "@/utils/AxiosUtility";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {
  itemToBeDeleted: any;
  openDeleteClientModal: boolean;
  setOpenDeleteClientModal: React.Dispatch<React.SetStateAction<boolean>>;
  reFetch: any;
}
export const DeleteClientModal = ({
  itemToBeDeleted,
  openDeleteClientModal,
  setOpenDeleteClientModal,
  reFetch,
}: Props) => {
  const handleDelete = async (itemToBeDeleted: any) => {
    try {
      const token = localStorage.getItem('token');
      const results = await DELETE(`/tenants/${itemToBeDeleted.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': token
        }
      });
      if (results?.status === 200) {
        toast.success("Client Deleted Successfully!");
        reFetch();
        if (openDeleteClientModal && setOpenDeleteClientModal) {
          setOpenDeleteClientModal(!openDeleteClientModal);
        }
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Dialog
      open={openDeleteClientModal}
      onClose={() => setOpenDeleteClientModal(!openDeleteClientModal)}
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
          maxWidth: "400px",
        },
      }}
    >
      {/* Close button on the top-right */}
      <Box sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenDeleteClientModal(!openDeleteClientModal)}
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

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <DeleteIcon sx={{ fontSize: 50, color: "error.main" }} />
      </Box>

      {/* Warning Message */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" align="center">
          Are you sure you want to delete this client?
        </Typography>
      </Box>

      {/* Confirmation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          onClick={() => handleDelete(itemToBeDeleted)}
        >
          Yes, Delete
        </Button>
        <Button
          variant="outlined"
          onClick={() => setOpenDeleteClientModal(!openDeleteClientModal)}
        >
          No, Cancel
        </Button>
      </Box>
    </Dialog>
  );
};
