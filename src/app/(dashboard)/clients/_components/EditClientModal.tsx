import React, { Dispatch, SetStateAction } from "react";
import { Box, Dialog, IconButton, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditClient from "./EditClient";

interface CreateClientModalProps {
  itemToBeEdited: any;
  openEditClientInfoModal: boolean;
  setOpenEditClientInfoModal: Dispatch<SetStateAction<boolean>>;
  reFetch: any;
}

const EditClientModal = ({
  itemToBeEdited,
  openEditClientInfoModal,
  setOpenEditClientInfoModal,
  reFetch,
}: CreateClientModalProps) => {
  const theme = useTheme();

  return (
    <Dialog
      open={openEditClientInfoModal}
      onClose={() => setOpenEditClientInfoModal(!openEditClientInfoModal)}
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
          maxWidth: "600px",
        },
      }}
    >
      {/* Close button on the top-right */}
      <Box sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={() => setOpenEditClientInfoModal(!openEditClientInfoModal)}
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <EditClient
          itemToBeEdited={itemToBeEdited}
          reFetch={reFetch}
          openEditClientInfoModal={openEditClientInfoModal}
          setOpenEditClientInfoModal={setOpenEditClientInfoModal}
        />
      </Box>
    </Dialog>
  );
};

export default EditClientModal;
