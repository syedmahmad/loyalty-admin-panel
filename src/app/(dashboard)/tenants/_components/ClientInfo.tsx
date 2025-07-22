import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Typography,
  useTheme,
  Box,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EditClientModal from "./EditClientModal";
import { DeleteClientModal } from "./DeleteClientModal";
import MoreVertIcon from '@mui/icons-material/MoreVert';


const ClientInfo = ({ clientInfo, reFetch }: any) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const open = Boolean(anchorEl);


const handleClose = () => {
  setAnchorEl(null);
};
const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(event.currentTarget);
};

  const [openEditClientInfoModal, setOpenEditClientInfoModal] = useState(false);
  const [itemToBeEdited, setItemToBeEdited] = useState<any>(null);

  const handleOpenEditModal = (item: any) => {
    setOpenEditClientInfoModal(true);
    setItemToBeEdited(item);
  };

  const [openDeleteClientModal, setOpenDeleteClientModal] = useState(false);
  const [itemToBeDeleted, setItemToBeDeleted] = useState<any>(null);

  const handleDelete = async (clientInfo: any) => {
    setOpenDeleteClientModal(true);
    setItemToBeDeleted(clientInfo);
  };

  return (
    <Grid2 container>
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box  sx={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            gap: 1,
          }}>
         <IconButton onClick={handleMenuClick}>
                      <MoreVertIcon/>
                          </IconButton>
                        <Menu
                      anchorEl={anchorEl}
    open={open}
    onClose={handleClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
     slotProps={{
    paper: {
      sx: {
        boxShadow: 'none',               
        border: '1px solid #e0e0e0',     
        mt: 1,                           
      },
    },
  }}
  >
       <MenuItem onClick={() =>{ handleClose();
       handleOpenEditModal(clientInfo)}}>
  <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                               Edit
                          </MenuItem>
                           <MenuItem onClick={() =>{ handleClose(); 
                              handleDelete(clientInfo)}}> 
                         <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
        Delete
      </MenuItem>
    </Menu>
        </Box>
      </Box>

      <Grid2 xs={12} sx={{ mb: 1 }}>
        <Tooltip title={clientInfo.name || ""} arrow>
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
        <ClientDetails clientInfo={clientInfo} />
      </Grid2>

      <Grid2 xs={12} md={12} sx={{ mt: 2 }}>
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',     
      width: '100%',
    }}
  >
    <Button
      variant="outlined"
      endIcon={<KeyboardArrowRightIcon />}
      onClick={() => {
        localStorage.setItem("client-info", JSON.stringify(clientInfo));
        window.location.pathname = "/business-units/view";
      }}
    >
      Details
    </Button>
  </Box>
</Grid2>
      {openEditClientInfoModal && (
        <EditClientModal
          itemToBeEdited={itemToBeEdited}
          openEditClientInfoModal={openEditClientInfoModal}
          setOpenEditClientInfoModal={setOpenEditClientInfoModal}
          reFetch={reFetch}
        />
      )}

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


const ClientDetails = ({ clientInfo }: any) => {
  const theme = useTheme();

  return (
    <Grid2 container spacing={1}>
      <Grid2 xs={6}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.palette.primary.dark,
          }}
        >
          <b>Domain:</b>
        </Typography>
      </Grid2>
      <Grid2 xs={6} display="flex" justifyContent="flex-end">
        <Typography>
          <b>{clientInfo.domain}</b>
        </Typography>
      </Grid2>

      <Grid2 xs={6}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.palette.primary.dark,
          }}
        >
          <b>Currency:</b>
        </Typography>
      </Grid2>
      <Grid2 xs={6} display="flex" justifyContent="flex-end">
        <Typography>
          <b>{clientInfo.currency || "N/A"}</b>
        </Typography>
      </Grid2>
    </Grid2>
  );
};
