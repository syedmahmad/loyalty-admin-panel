import React from "react";
import {
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";

interface ContactNumberFieldProps {
  value: string;
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  fieldsetcolor?: string; // Optional prop for customizing the fieldset color
  placeholder?: string; // Optional placeholder
}

const CustomPhoneInput: React.FC<ContactNumberFieldProps> = ({
  value,
  countryCode,
  onCountryCodeChange,
  onChange,
  error = false,
  helperText = "",
  fieldsetcolor,
  placeholder = "Enter phone number",
  ...otherProps // Allow other props to be passed
}) => {
  const theme = useTheme();

  return (
    <TextField
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: fieldsetcolor || theme.palette.primary.main,
          },
          "&:hover fieldset": {
            borderColor: fieldsetcolor || theme.palette.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderColor: fieldsetcolor || theme.palette.primary.main,
          },
        },
      }}
      fullWidth
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      variant="outlined"
      name="ContactNo"
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Select
              value={countryCode}
              onChange={(e) => onCountryCodeChange(e.target.value as string)}
              variant="standard"
              disableUnderline
              sx={{
                minWidth: 80, // Ensure it fits well with the rest of the input
                maxWidth: 80,
                mr: 1,
                borderRight: "1px solid #ccc",
                "& .MuiSelect-select": {
                  padding: "4px 8px",
                },
              }}
            >
              <MenuItem value="+966">+966</MenuItem>
              <MenuItem value="+91">+91</MenuItem>
              <MenuItem value="+92">+92</MenuItem>
            </Select>
          </InputAdornment>
        ),
      }}
      {...otherProps} // Spread additional props
    />
  );
};

export default CustomPhoneInput;
