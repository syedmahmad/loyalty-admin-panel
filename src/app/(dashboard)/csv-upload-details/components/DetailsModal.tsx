import { Box, Dialog, IconButton, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import { toast } from "react-toastify";
import { DELETE } from "@/utils/AxiosUtility";
import DeleteIcon from "@mui/icons-material/Delete";
import { CampaignDetailsTable } from "./CampignDetailsTable";

interface Props {
  data: any
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  apiState: any;
  campaignName: string;
}
export const DetailsModal = ({
  data,
  openModal,
  setOpenModal,
  apiState,
  campaignName
}: Props) => {

  return (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(!openModal)}
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
          maxWidth: "1000px",
        },
      }}
      fullWidth
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

      <CampaignDetailsTable response={data} apiState={apiState} campaignName={campaignName}/> 
      
    </Dialog>
  );
};
