import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import * as yup from "yup";

const CreateClient = ({ reFetch, setOpenModal }: any) => {

  // #region general for state variables
  const theme = useTheme();

  const [formErrors, setFormErrors] = useState<any>({});

  const [clientInfo, setClientInfo] = useState({
    name: "",
    domain: "",
    created_by: 1,
    updated_by: 1,
  });

  // #endregion


  // #region to handle change in state and show updated data on in the states
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  // #endregion

  // #region for schema
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    domain: yup.string().required("Domain is required"),
  });

  // #endregion


  // #region for creating client and validating the entered data
  const handleSubmit = async () => {
    try {
      await schema.validate(clientInfo, { abortEarly: false });
      setFormErrors({});

      const payload = {
        name: clientInfo.name,
        domain: clientInfo.domain,
        created_by: clientInfo.created_by,
        updated_by: clientInfo.updated_by,
      };

      const response = await POST("/tenants", payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      if (response?.status === 201) {
        toast.success("Tenants Register Successfully");
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

  // #endregion

  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={12}>
        <Typography
          variant="h4"
          color={theme.palette.primary.dark}
          textTransform="capitalize"
          align="center"
        >
          Register Tenants
        </Typography>
      </Grid2>

      <Grid2 xs={12} md={6}>
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

      <Grid2 xs={12} md={6}>
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

      <Grid2 xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          {"Register Tenants"}
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default CreateClient;
