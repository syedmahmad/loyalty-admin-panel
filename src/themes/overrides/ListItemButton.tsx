// material-ui
import { ColorProps } from '@/types/extended';
import getColors from '@/utils/getColors';
import { alpha, Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - LIST ITEM ICON ||============================== //

export default function ListItemButton(theme: Theme, color: ColorProps) {
  const colors = getColors(theme, color);
  const { light } = colors;
  return {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.main
            }
          },
          '&:hover': {
            backgroundColor: `${alpha(light, 0.1)} !important`
          },
        }
      }
    }
  };
}
