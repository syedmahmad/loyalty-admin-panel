import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Button,
  Typography,
  useTheme,
  TextField,
  MenuItem,
  Box,
  Autocomplete,
  Chip,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { countryService, OnboardStatus } from "@/services/countryService";
import { languageService } from "@/services/languageService";
import { currencyService } from "@/services/currencyService";

const CreateClient = ({ reFetch, setOpenModal }: any) => {
  const theme = useTheme();
  const [formErrors, setFormErrors] = useState<any>({});
  const [clientInfo, setClientInfo] = useState({
    name: "",
    domain: "",
    currency: "",
    created_by: 1,
    updated_by: 1,
    countryId: "",
    languageIds: [],
    currencyIds: [],
  });

  const { data: countriesData } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countryService.getCountries(),
  });

  const { data: languagesData } = useQuery({
    queryKey: ["languages"],
    queryFn: () => languageService.getLanguages({ limit: 100 }),
  });

  const { data: currenciesData } = useQuery({
    queryKey: ["currencies"],
    queryFn: () =>
      currencyService.getCurrencies({ onboardStatus: "ONBOARDED", limit: 100 }),
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    domain: yup.string().required("Domain is required"),
    // currency: yup.string().required("Currency is required"),
    // countryId: yup.string().required("Country is required"),
    // languageIds: yup
    //   .array()
    //   .of(yup.number())
    //   .min(1, "At least one language is required")
    //   .required("Language is required"),
    // currencyIds: yup
    //   .array()
    //   .of(yup.number())
    //   .min(1, "At least one currency is required")
    //   .required("currency is required"),
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
        country_id: clientInfo?.countryId,
        languageIds: clientInfo?.languageIds,
        currencyIds: clientInfo?.currencyIds,
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

      {/* Country */}
      <Grid2 xs={12} md={12}>
        <Autocomplete
          fullWidth
          options={countriesData?.countries || []}
          getOptionLabel={(option: any) => option?.name || ""}
          onChange={(_, newValue) => {
            handleChange({
              target: {
                name: "countryId",
                value: newValue ? newValue.id : "",
              },
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              name="countryId"
              label="Country"
              error={!!formErrors.countryId}
              helperText={formErrors.countryId}
            />
          )}
        />
      </Grid2>

      {/* Language */}
      <Grid2 xs={12} md={12}>
        <Autocomplete
          multiple
          fullWidth
          options={
            Array.isArray(languagesData?.languages)
              ? languagesData?.languages
              : []
          }
          getOptionLabel={(option: any) => `${option.flag} ${option.name}`}
          onChange={(_, newValue) => {
            handleChange({
              target: {
                name: "languageIds",
                value: newValue.map((lang: any) => lang.id),
              },
            });
          }}
          renderTags={(selected: any, getTagProps: any) =>
            selected.map(
              (
                option: { id: number; flag: string; name: string },
                index: number
              ) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={option.id}
                    label={`${option.flag} ${option.name}`}
                    {...tagProps}
                  />
                );
              }
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              required
              name="languageIds"
              label="Languages"
              placeholder="Select languages"
              error={!!formErrors.languageIds}
              helperText={formErrors.languageIds}
            />
          )}
        />
      </Grid2>

      {/* Currency */}
      <Grid2 xs={12} md={12}>
        <Autocomplete
          multiple
          fullWidth
          options={
            Array.isArray(currenciesData?.currencies)
              ? currenciesData?.currencies
              : []
          }
          getOptionLabel={(option: any) => `${option.flag} ${option.name}`}
          onChange={(_, newValue) => {
            handleChange({
              target: {
                name: "currencyIds",
                value: newValue.map((currency: any) => currency.id),
              },
            });
          }}
          renderTags={(selected: any, getTagProps: any) =>
            selected.map(
              (
                option: { id: number; flag: string; name: string },
                index: number
              ) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={option.id}
                    label={`${option.flag} ${option.name}`}
                    {...tagProps}
                  />
                );
              }
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              required
              name="currencyIds"
              label="Currencies"
              placeholder="Select Currencies"
              error={!!formErrors.currencyIds}
              helperText={formErrors.currencyIds}
            />
          )}
        />
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
