import {
  Avatar,
  Box,
  Card,
  CardContent,
  Drawer,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  orderDetails: any;
}

export default function WalletOrderDrawer({
  orderDetails,
  open,
  onClose,
}: Props) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={500} p={3}>
        <Typography variant="h5" mb={2}>
          Order Details
        </Typography>

        <Grid container spacing={1} mb={4}>
          {orderDetails &&
            Object?.entries(orderDetails).map(([label, value]) => {
              if (label === "id" || label === "items") return null;
              return (
                <React.Fragment key={label}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" fontSize={14}>
                      {label
                        .replace(/_/g, " ")
                        .replace(/([A-Z])/g, " $1")
                        .replace(/\s+/g, " ")
                        .trim()
                        .replace(/^./, (s) => s.toUpperCase())}{" "}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontSize={14} textAlign="right">
                      {String(value)}
                    </Typography>
                  </Grid>
                </React.Fragment>
              );
            })}
        </Grid>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Order #{orderDetails?.order_id}
        </Typography>

        <Stack spacing={2}>
          {orderDetails?.items?.map((item: any, index: number) => (
            <Card
              key={index}
              variant="outlined"
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                <Avatar
                  variant="rounded"
                  src={item.image || undefined}
                  sx={{ width: 64, height: 64, mr: 2 }}
                >
                  {!item.image && <CollectionsIcon />}
                </Avatar>
                <Box flex={1}>
                  <Typography fontWeight="bold">{item.name}</Typography>
                  <Typography color="primary">Price: {item.price}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.color}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {item.quantity}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Drawer>
  );
}
