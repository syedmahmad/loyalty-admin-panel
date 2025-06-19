// ==============================|| OVERRIDES - BUTTON ||============================== //

import { ColorProps } from "@/types/extended";
import getColors from "@/utils/getColors";
import { alpha, Theme } from "@mui/material";

export default function ButtonBase(theme: Theme, color: ColorProps) {
  const colors = getColors(theme, color);
  const { light } = colors;
  return {
    MuiButtonBase: {
      root: {
        '&:hover': {
            backgroundColor: `${alpha(light, 0.1)} !important`
          },
      },
      defaultProps: {
        disableRipple: true
      }
    }
  };
}
