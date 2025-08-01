"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import { useParams, useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { GET, PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

const fetchSegment = async (id: any) => {
  const response = await GET(`/customer-segments/view-customers/${id}`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch segment");
  }
  return response.data;
};

const fetchAllCustomers = async (tenantId: number) => {
  const response = await GET(`/customers`);
  if (response?.status !== 200) {
    throw new Error("Failed to fetch customers");
  }
  return response.data;
};

const addCustomerToSegment = async (
  segmentId: number,
  customerId: number,
  userSecret: string
) => {
  return await PUT(
    `/customer-segments/add-customer/${segmentId}`,
    { customer_id: customerId },
    userSecret
  );
};

const removeCustomerFromSegment = async (
  segmentId: number,
  customerId: number,
  userSecret: string
) => {
  return await PUT(
    `/customer-segments/remove-customer/${segmentId}`,
    { customer_id: customerId },
    userSecret
  );
};

const CustomerSegmentEditPage = ({ segmentId, setSelectedSegmentId }: any) => {
  const [segment, setSegment] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSecret, setUserSecret] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const secret = localStorage.getItem("token");
    if (secret) setUserSecret(secret);
  }, []);

  useEffect(() => {
    if (!segmentId) return;
    setLoading(true);
    const fetchData = async () => {
      const segment = await fetchSegment(segmentId);
      const clientInfo = localStorage.getItem("client-info");
      const parsed = JSON.parse(clientInfo!);
      const tenantId = parsed?.id || 1;
      const allCustomers = await fetchAllCustomers(tenantId);
      setSegment(segment);
      setCustomers(allCustomers);
      setLoading(false);
    };
    fetchData();
  }, [segmentId]);

  const handleAddCustomer = async () => {
    console.log(!selectedCustomerIds.length, !segmentId, !userSecret);

    if (!selectedCustomerIds.length || !segmentId || !userSecret) {
      return;
    }

    try {
      // Add all selected customers to the segment
      await Promise.all(
        selectedCustomerIds.map((id) =>
          addCustomerToSegment(+segmentId, +id, userSecret)
        )
      );

      const updated = await fetchSegment(segmentId);
      setSegment(updated);
      setSelectedCustomerIds([]); // Reset selection
      toast.success("Customers added to segment");
    } catch (error) {
      toast.error("Failed to add customers to segment");
      console.error(error);
    }
  };

  const handleRemoveCustomer = async (customerId: number) => {
    if (!segmentId || !userSecret) return;
    await removeCustomerFromSegment(+segmentId, customerId, userSecret);
    const updated = await fetchSegment(segmentId);
    setSegment(updated);
    toast.success("Customer removed from segment");
  };

  const segmentCustomers = segment?.members?.map((m: any) => m.customer) || [];

  return (
    <>
      <Drawer
        anchor="right"
        open={true}
        onClose={() => {
          setSelectedSegmentId(null);
        }}
        PaperProps={{
          sx: { width: 400 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography fontSize="20px" fontWeight={600}>
            Edit Customer Segment
          </Typography>
          <IconButton
            edge="end"
            onClick={() => router.push("/customer-segment/view")}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {loading || !segment ? (
          <Box mt={6} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <CardContent>
            <Formik
              enableReinitialize
              initialValues={{
                name: segment.name || "",
                description: segment.description || "",
              }}
              validationSchema={Yup.object().shape({
                name: Yup.string().required("Name is required"),
                description: Yup.string(),
              })}
              onSubmit={() => {}}
            >
              {({ values, errors, touched, handleChange }) => (
                <Form noValidate>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Segment Name"
                        value={values.name}
                        onChange={handleChange}
                        error={touched.name && Boolean(errors.name)}
                        helperText={
                          touched.name && typeof errors.name === "string"
                            ? errors.name
                            : undefined
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <GroupIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        value={values.description}
                        onChange={handleChange}
                        error={
                          touched.description && Boolean(errors.description)
                        }
                        helperText={
                          touched.description &&
                          typeof errors.description === "string"
                            ? errors.description
                            : undefined
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled
                      />
                    </Grid>

                    {customers.filter(
                      (c) => !segmentCustomers.some((sc: any) => sc.id === c.id)
                    ).length > 0 ? (
                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Add Customers"
                          SelectProps={{
                            multiple: true,
                            value: selectedCustomerIds,
                            onChange: (e: any) =>
                              setSelectedCustomerIds(e.target.value),
                            renderValue: (selected: any) =>
                              customers
                                .filter((c) => selected.includes(c.id))
                                .map((c) => c.name)
                                .join(", "),
                          }}
                        >
                          {customers.length > 0 &&
                            customers
                              .filter(
                                (c) =>
                                  !segmentCustomers.some(
                                    (sc: any) => sc.id === c.id
                                  )
                              )
                              .map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                  {c.name} (
                                  <span
                                    style={{
                                      maxWidth: 150,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {c.email.trim()}
                                  </span>
                                  )
                                </MenuItem>
                              ))}
                        </TextField>
                      </Grid>
                    ) : (
                      <Grid item xs={12}>
                        <Typography
                          variant="h5"
                          textAlign="center"
                          sx={{ mt: 2 }}
                        >
                          No customers available to add.
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={() => handleAddCustomer()}
                        disabled={!selectedCustomerIds.length}
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>

            {segmentCustomers.length ? (
              <Box mt={4}>
                <Typography variant="h6">Segment Customers</Typography>
                <List>
                  {segmentCustomers.map((c: any) => (
                    <ListItem
                      key={c.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveCustomer(c.id)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={c.name}
                        secondary={
                          <Typography
                            noWrap
                            sx={{ maxWidth: "300px", display: "flex", gap: 1 }}
                          >
                            <Tooltip title={c.email}>
                              <span>{c.email}</span>
                            </Tooltip>
                            |
                            <Tooltip title={c.phone}>
                              <span>{c.phone}</span>
                            </Tooltip>
                          </Typography>
                        }
                        primaryTypographyProps={{
                          noWrap: true,
                          sx: { maxWidth: "200px" }, // adjust as needed
                        }}
                        secondaryTypographyProps={{
                          noWrap: true,
                          sx: { maxWidth: "300px" }, // adjust width to your layout
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : null}
          </CardContent>
        )}
      </Drawer>
    </>
  );
};

export default CustomerSegmentEditPage;
