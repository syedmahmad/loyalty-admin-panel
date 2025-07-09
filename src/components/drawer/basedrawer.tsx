'use client';

import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type BaseDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
};

const BaseDrawer = ({ open, onClose, title, children, width = 400 }: BaseDrawerProps) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
        >
          <Typography fontSize="20px" fontWeight={600}>
            {title}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box p={2} sx={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Drawer>
  );
};

export default BaseDrawer;
