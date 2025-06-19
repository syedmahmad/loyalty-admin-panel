import React, { Dispatch, SetStateAction } from "react";
import CreateClient from "./CreateClient";
import { Box, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CreateClientModalProps {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  reFetch: any;
}

const CreateClientModal = ({
  openModal,
  setOpenModal,
  reFetch,
}: CreateClientModalProps) => {
  return (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(!openModal)}
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
          onClick={() => setOpenModal(!openModal)}
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
        <CreateClient
          reFetch={reFetch}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      </Box>
    </Dialog>
  );
};

export default CreateClientModal;
