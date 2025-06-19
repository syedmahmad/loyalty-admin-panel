import React, { Dispatch, SetStateAction } from "react";
import CreateCategory from "./CreateCategory";
import { Box, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CreateCategoryModalProps {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  reFetch: any;
}

const CreateCategoryModal = ({
  openModal,
  setOpenModal,
  reFetch,
}: CreateCategoryModalProps) => {
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
        <CreateCategory
          reFetch={reFetch}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      </Box>
    </Dialog>
  );
};

export default CreateCategoryModal;
