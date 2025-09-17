"use client";

import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DRAWER_TYPE_BULK_UPLOAD } from "@/constants/constants";

type BaseDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  drawerType?: string | null;
  drawerFor?: string | null;
};

const BaseDrawer = ({
  open,
  onClose,
  title,
  children,
  width = 400,
  drawerType,
  drawerFor,
}: BaseDrawerProps) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{ width, display: "flex", flexDirection: "column", height: "100%" }}
      >
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

          {drawerType === DRAWER_TYPE_BULK_UPLOAD && (
            <Button
              variant="outlined"
              color="primary"
              type="submit"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              onClick={() => {
                window.location.href =
                  drawerFor == "customerSegment"
                    ? "/Customer_Segment_Example.csv"
                    : "/Coupons.csv";
              }}
            >
              Download Template
            </Button>
          )}

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box p={2} sx={{ overflowY: "auto", flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Drawer>
  );
};

export default BaseDrawer;
