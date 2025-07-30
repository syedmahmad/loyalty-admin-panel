import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Button,
  Typography,
  useTheme,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import * as yup from "yup";

const currencyOptions = [
  { code: "SAR", label: "Saudi Riyal" },
  { code: "PKR", label: "Pakistani Rupee" },
  { code: "INR", label: "Indian Rupee" },
];

const CreateClient = ({ reFetch, setOpenModal }: any) => {
  const theme = useTheme();
  const [formErrors, setFormErrors] = useState<any>({});
  const [clientInfo, setClientInfo] = useState({
    name: "",
    domain: "",
    currency: "",
    created_by: 1,
    updated_by: 1,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    domain: yup.string().required("Domain is required"),
    currency: yup.string().required("Currency is required"),
  });

  const handleSubmit = async () => {
    try {
      await schema.validate(clientInfo, { abortEarly: false });
      setFormErrors({});

      const payload = {
        name: clientInfo.name,
        domain: clientInfo.domain,
        currency: clientInfo.currency,
        created_by: clientInfo.created_by,
        updated_by: clientInfo.updated_by,
      };

      const response = await POST("/tenants", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response?.status === 201) {
        toast.success("Tenant registered successfully");
        reFetch();
        setOpenModal(false);
      }
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const errors: any = {};
        err.inner.forEach((error: any) => {
          errors[error.path] = error.message;
        });
        setFormErrors(errors);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
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
        ></Typography>
      </Grid2>

      <Grid2 xs={12} md={12}>
        <CustomTextfield
          required
          fullWidth
          name="name"
          label={"Name"}
          type="text"
          id="name"
          value={clientInfo.name}
          onChange={handleChange}
          error={!!formErrors.name}
          helperText={formErrors.name}
          inputProps={{ dir: "ltr" }}
        />
      </Grid2>

      <Grid2 xs={12} md={12}>
        <CustomTextfield
          required
          fullWidth
          name="domain"
          label={"Domain"}
          type="text"
          id="domain"
          value={clientInfo.domain}
          onChange={handleChange}
          error={!!formErrors.domain}
          helperText={formErrors.domain}
          inputProps={{ dir: "ltr" }}
        />
      </Grid2>

      <Grid2 xs={12} md={12}>
        <TextField
          select
          fullWidth
          name="currency"
          label="Currency"
          value={clientInfo.currency}
          onChange={handleChange}
          error={!!formErrors.currency}
          helperText={formErrors.currency}
        >
          {currencyOptions.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.label} ({currency.code})
            </MenuItem>
          ))}
        </TextField>
      </Grid2>

      <Grid2 xs={12} md={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button variant="outlined" color="primary" onClick={handleSubmit}>
            Register Tenants
          </Button>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default CreateClient;
