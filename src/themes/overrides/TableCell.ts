// material-ui
import { Theme } from "@mui/material/styles";

// ==============================|| OVERRIDES - TABLE CELL ||============================== //

export default function TableCell(theme: Theme) {
  const commonCell = {
    "&:not(:last-of-type)": {
      position: "relative",
      "&:after": {
        position: "absolute",
        content: '""',
        backgroundColor: theme.palette.divider,
        width: 1,
        height: "calc(100% - 30px)",
        right: 0,
        top: 16,
      },
    },
  };

  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "Outfit, sans-serif",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "14px",
          lineHeight: "21px",
          padding: 12,
          borderColor: theme.palette.divider,
        },
        sizeSmall: {
          padding: 8,
        },
        head: {
          fontFamily: "Outfit",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "14px",
          lineHeight: "21px",
          textTransform: "none",
          ...commonCell,
        },
        footer: {
          fontFamily: "Outfit",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "14px",
          lineHeight: "21px",
          textTransform: "none",
          ...commonCell,
        },
      },
    },
  };
}
