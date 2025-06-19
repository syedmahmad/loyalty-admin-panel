// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - DIALOG CONTENT TEXT ||============================== //

export default function Popover(theme: Theme) {
  return {
    MuiPopover: {
      styleOverrides: {
        pointerEvents: 'none',
        paper: {
          boxShadow: theme.shadows[1]
        }
      }
    },
    MuiPopoverContent: {
      styleOverrides: {
        pointerEvents: 'auto',
      }
    }
  };
}
