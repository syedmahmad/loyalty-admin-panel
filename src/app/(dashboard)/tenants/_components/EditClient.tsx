import React, { useState, useEffect } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Button,
  Typography,
  useTheme,
  TextField,
  MenuItem,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import * as yup from "yup";
import { toast } from "react-toastify";
import { PATCH } from "@/utils/AxiosUtility";

// Currency options
const currencyOptions = [
  { code: "SAR", label: "Saudi Riyal" },
  { code: "PKR", label: "Pakistani Rupee" },
  { code: "INR", label: "Indian Rupee" },
];

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  domain: yup.string().required("Domain is required"),
  currency: yup.string().required("Currency is required"),
});

const EditClient = ({
  itemToBeEdited,
  reFetch,
  setOpenEditClientInfoModal,
}: any) => {
  const theme = useTheme();
  const [errors, setErrors] = useState<any>({});
  const [clientInfo, setClientInfo] = useState({
    name: "",
    domain: "",
    currency: "",
  });

  useEffect(() => {
    if (itemToBeEdited) {
      setClientInfo({
        name: itemToBeEdited.name || "",
        domain: itemToBeEdited.domain || "",
        currency: itemToBeEdited.currency || "",
      });
    }
  }, [itemToBeEdited]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleSubmit = async (itemToBeEdited: any) => {
    try {
      await validationSchema.validate(clientInfo, { abortEarly: false });
      setErrors({});

      const payload = {
        name: clientInfo.name,
        domain: clientInfo.domain,
        currency: clientInfo.currency,
        updated_by: itemToBeEdited.updated_by || 1,
      };

      await PATCH(`/tenants/${itemToBeEdited.id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      toast.success("Updated Successfully!");
      reFetch();
      setOpenEditClientInfoModal(false);
    } catch (err: any) {
      const fieldErrors: any = {};
      if (err?.inner) {
        err.inner.forEach((error: any) => {
          fieldErrors[error.path] = error.message;
        });
      }
      setErrors(fieldErrors);
    }
  };

  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={12}>
        <Typography
          variant="h4"
          color={theme.palette.primary.dark}
          textTransform="capitalize"
          align="center"
        >
          Update Tenants Info
        </Typography>
      </Grid2>

      <Grid2 xs={12} md={6}>
        <CustomTextfield
          required
          fullWidth
          name="name"
          label="Name"
          value={clientInfo.name}
          onChange={handleChange}
          error={!!errors.name}
          helpertext={errors.name}
        />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <CustomTextfield
          required
          fullWidth
          name="domain"
          label="Domain"
          value={clientInfo.domain}
          onChange={handleChange}
          error={!!errors.domain}
          helpertext={errors.domain}
        />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <TextField
          select
          fullWidth
          required
          name="currency"
          label="Currency"
          value={clientInfo.currency}
          onChange={handleChange}
          error={!!errors.currency}
          helperText={errors.currency}
        >
          {currencyOptions.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.label} ({currency.code})
            </MenuItem>
          ))}
        </TextField>
      </Grid2>

      <Grid2 xs={12} display="flex" justifyContent="center">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleSubmit(itemToBeEdited)}
        >
          Update Data
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default EditClient;
