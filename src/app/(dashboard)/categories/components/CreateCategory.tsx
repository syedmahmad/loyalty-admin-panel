import React, { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  TextField,
  Button,
  Typography,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { CustomTextfield } from "@/components/CustomTextField";
import { POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import * as yup from "yup";

const CreateCategory = ({ reFetch, openModal, setOpenModal }: any) => {

  // #region general for state variables
  const theme = useTheme();

  const [formErrors, setFormErrors] = useState<any>({});

  const [categoryInfo, setCategoryInfo] = useState({
    name: "",
    channel: "",
  });
  const [channel, setChannel] = useState("sms");

  // #endregion


  // #region to handle change in state and show updated data on in the states
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setCategoryInfo({ ...categoryInfo, [name]: value });
  };

  const handleChannelChange = (e: any) => {
    setChannel(e.target.value);
  };

  // #endregion

  // #region for schema
  const schema = yup.object().shape({
    name: yup
      .string()
      .required("Category name is required"),
  });

  // #endregion


  // #region for creating category and validating the entered data
  const handleSubmit = async () => {

    const lcData = localStorage.getItem('user');
    const parseLCData = lcData && JSON.parse(lcData);
    const userId  = parseLCData.id
    try {
      await schema.validate(categoryInfo, { abortEarly: false });
      setFormErrors({});

      const payload = {
        name: categoryInfo.name,
        channel: channel
      };

      const token = localStorage.getItem('token');

      const response = await POST("categories", payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-secret': token
        }
      });
      if (response?.status === 201) {
        toast.success("Category Register Successfully");
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
          Register Category
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
          value={categoryInfo.name}
          onChange={handleChange}
          error={!!formErrors.name}
          helperText={formErrors.name}
          inputProps={{ dir: "ltr" }}
          lang={"en"}
        />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Channel</InputLabel>
          <Select value={channel} label="Channel" onChange={handleChannelChange}>
            <MenuItem value="sms">SMS</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="whatsapp">Whatsapp</MenuItem>
          </Select>
        </FormControl>
      </Grid2>

      <Grid2 xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          {"Register Category"}
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default CreateCategory;
