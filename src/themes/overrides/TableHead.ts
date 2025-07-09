import { Theme } from "@mui/material/styles";

// ==============================|| OVERRIDES - TABLE HEAD ||============================== //

export default function TableHead(theme: Theme) {
  return {
    MuiTableHead: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `2px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily: "Outfit, sans-serif",
          fontWeight: 500,
          fontStyle: "normal",
          fontSize: "14px",
          lineHeight: "18px",
          color: theme.palette.text.primary,
          opacity: 0.6,
          textTransform: "none",
          whiteSpace: "nowrap",
        },
      },
    },
  };
}
