import { Box, Dialog, IconButton, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import { toast } from "react-toastify";
import { DELETE } from "@/utils/AxiosUtility";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {
  openDeleteSenderModal: boolean;
  setOpenDeleteSenderModal: React.Dispatch<React.SetStateAction<boolean>>;
  senderToBeDeleted: any;
  reFetch: any;
}
export const DeleteSenderModal = ({
  senderToBeDeleted,
  openDeleteSenderModal,
  setOpenDeleteSenderModal,
  reFetch,
}: Props) => {
  const handleDelete = async (senderToBeDeleted: any) => {
    try {
      const results = await DELETE(`/senders/${senderToBeDeleted.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': localStorage.getItem('token')
        }
      });
      if (results?.status === 200) {
        toast.success("Sender Deleted Successfully!");
        reFetch();
        if (openDeleteSenderModal && setOpenDeleteSenderModal) {
          setOpenDeleteSenderModal(!openDeleteSenderModal);
        }
      } else {
        // do nothing
        // toast.error("Something went wrong.");
      }
    } catch (error: any) {
      if (error.response.data.code === "SENDER_IN_USE") {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Dialog
      open={openDeleteSenderModal}
      onClose={() => setOpenDeleteSenderModal(!openDeleteSenderModal)}
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
          onClick={() => setOpenDeleteSenderModal(!openDeleteSenderModal)}
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
          Are you sure you want to delete this Sender?
        </Typography>
      </Box>

      {/* Confirmation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          onClick={() => handleDelete(senderToBeDeleted)}
        >
          Yes, Delete
        </Button>
        <Button
          variant="outlined"
          onClick={() => setOpenDeleteSenderModal(!openDeleteSenderModal)}
        >
          No, Cancel
        </Button>
      </Box>
    </Dialog>
  );
};
