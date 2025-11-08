import React, { useState, useEffect } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Button,
  Typography,
  useTheme,
  TextField,
  MenuItem,
  Autocomplete,
  Chip,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import * as yup from "yup";
import { toast } from "react-toastify";
import { PATCH } from "@/utils/AxiosUtility";
import { useQuery } from "@tanstack/react-query";
import { countryService } from "@/services/countryService";
import { languageService } from "@/services/languageService";
import { currencyService } from "@/services/currencyService";

// Currency options
const currencyOptions = [
  { code: "SAR", label: "Saudi Riyal" },
  { code: "PKR", label: "Pakistani Rupee" },
  { code: "INR", label: "Indian Rupee" },
];

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  domain: yup.string().required("Domain is required"),
  countryId: yup.string().required("Country is required"),
  languageIds: yup
    .array()
    .of(yup.mixed().test("is-valid", "Invalid language", (val) => !!val))
    .min(1, "At least one language is required")
    .required("Language is required"),
  currencyIds: yup
    .array()
    .of(yup.mixed().test("is-valid", "Invalid currency", (val) => !!val))
    .min(1, "At least one currency is required")
    .required("Currency is required"),
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

  useEffect(() => {
    if (itemToBeEdited) {
      setClientInfo({
        name: itemToBeEdited.name || "",
        domain: itemToBeEdited.domain || "",
        countryId: itemToBeEdited?.country?.id,
        languageIds:
          itemToBeEdited?.languages?.map((cl: any) => cl?.language) || [],
        currencyIds:
          itemToBeEdited?.currencies?.map((cl: any) => cl?.currency) || [],
      });
    }
  }, [itemToBeEdited]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleSubmit = async (itemToBeEdited: any) => {
    try {
      const validated = await validationSchema.validate(clientInfo, {
        abortEarly: false,
      });
      setErrors({});

      const payload = {
        name: clientInfo.name,
        domain: clientInfo.domain,
        updated_by: itemToBeEdited.updated_by || 1,
        country_id: clientInfo?.countryId,
        languageIds: clientInfo?.languageIds,
        currencyIds: clientInfo?.currencyIds,
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
        ></Typography>
      </Grid2>

      <Grid2 xs={12} md={12}>
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

      <Grid2 xs={12} md={12}>
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

      {/* Country */}
      <Grid2 xs={12} md={12}>
        <Autocomplete
          fullWidth
          options={countriesData?.countries || []}
          getOptionLabel={(option: any) => option?.name || ""}
          value={
            countriesData?.countries?.find(
              (c: any) => c.id === clientInfo.countryId
            ) || null
          }
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
              error={!!errors.countryId}
              helperText={errors.countryId}
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
          value={(Array.isArray(clientInfo?.languageIds)
            ? clientInfo.languageIds
            : []
          )
            .map((singleLang: any) => {
              const id =
                typeof singleLang === "object" ? singleLang.id : singleLang;
              return languagesData?.languages.find(
                (lang: any) => lang?.id === id
              );
            })
            .filter(Boolean)}
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
              error={!!errors.languageIds}
              helperText={errors.languageIds}
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
          value={(Array.isArray(clientInfo?.currencyIds)
            ? clientInfo.currencyIds
            : []
          )
            .map((currency: any) => {
              const id = typeof currency === "object" ? currency.id : currency;
              return currenciesData?.currencies.find(
                (singleCurreny: any) => singleCurreny?.id == id
              );
            })
            .filter(Boolean)}
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
              error={!!errors.currencyIds}
              helperText={errors.currencyIds}
            />
          )}
        />
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
