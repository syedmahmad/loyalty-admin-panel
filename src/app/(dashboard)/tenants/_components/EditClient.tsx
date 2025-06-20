import React, { useState, useEffect } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Button, Typography, useTheme } from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import * as yup from "yup";
import { toast } from "react-toastify";
import { PATCH } from "@/utils/AxiosUtility";

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  domain: yup.string().required("Domain is required"),
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
  });
  useEffect(() => {
    if (itemToBeEdited) {
      setClientInfo({
        name: itemToBeEdited.name || "",
        domain: itemToBeEdited.domain || "",
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
        updated_by: itemToBeEdited.updated_by || 1,
      };

      await PATCH(`/tenants/${itemToBeEdited.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      toast.success("Updated Successfully!");
      reFetch();
      setOpenEditClientInfoModal(false);
    } catch (err: any) {
      const fieldErrors: any = {};
      err.inner.forEach((error: any) => {
        fieldErrors[error.path] = error.message;
      });
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
          {"Update Tenants Info"}
        </Typography>
      </Grid2>

      {Object.entries(itemToBeEdited).map(([key, label]) => {
        if (key === "id" || key === "created_at" || key === "updated_at" || key === "created_by" || key === "updated_by") {
          return null; // Skip these fields
        }
          return (
            <Grid2 xs={12} md={6} key={key}>
              <CustomTextfield
                required
                fullWidth
                name={key}
                label={label}
                value={(clientInfo as any)[key] || ""}
                onChange={handleChange}
                error={Boolean(errors[key])}
                helpertext={errors[key]}
              />
            </Grid2>
          );
      })}

      <Grid2 xs={12} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSubmit(itemToBeEdited)}
        >
          {"Update Data"}
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default EditClient;
