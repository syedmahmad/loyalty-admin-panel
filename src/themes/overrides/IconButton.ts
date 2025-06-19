// material-ui
import { ColorProps } from '@/types/extended';
import getColors from '@/utils/getColors';
import { alpha, Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - ICON BUTTON ||============================== //

export default function IconButton(theme: Theme, color: ColorProps) {
  const colors = getColors(theme, color);
  const { light } = colors;
  return {
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&:hover': {
             backgroundColor: `${alpha(light, 0.1)} !important`
          },
        },
        sizeLarge: {
          width: theme.spacing(5.5),
          height: theme.spacing(5.5),
          fontSize: '1.25rem'
        },
        sizeMedium: {
          width: theme.spacing(4.5),
          height: theme.spacing(4.5),
          fontSize: '1rem'
        },
        sizeSmall: {
          width: theme.spacing(3.75),
          height: theme.spacing(3.75),
          fontSize: '0.75rem'
        }
      }
    }
  };
}
