import { TextField, useTheme } from "@mui/material";
import React from "react";

export const CustomTextfield = (props: any) => {
  const theme = useTheme();
  const { fieldsetcolor, placeholder, lang = "en", ...otherProps } = props;

  const isArabic = lang === "ar";
  const defaultPlaceholder = isArabic
    ? "اكتب شيئًا هنا..."
    : "write something here...";

  return (
    <TextField
      {...otherProps}
      helperText={otherProps.helperText}
      variant="outlined"
      fullWidth
      placeholder={placeholder ? placeholder : defaultPlaceholder}
      FormHelperTextProps={{ sx: { ml: 0 } }}
      InputLabelProps={{
        sx: {
          direction: isArabic ? "rtl" : "ltr",
          textAlign: isArabic ? "right" : "left",
        },
      }}
      inputProps={{
        ...otherProps.inputProps,
        dir: isArabic ? "rtl" : "ltr",
        style: { textAlign: isArabic ? "right" : "left" },
      }}
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
    />
  );
};
