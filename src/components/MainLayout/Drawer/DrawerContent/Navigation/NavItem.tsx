/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  forwardRef,
  useEffect,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  alpha,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";

// project import
// import useConfig from '../../../../../hooks/useConfig';
import { dispatch, useSelector } from "../../../../../store";
import { activeItem, openDrawer } from "../../../../../store/reducers/menu";

// types
import { LinkTarget, NavItemType } from "../../../../../types/menu";
// import { ThemeMode } from '../../../../../types/config';
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// ==============================|| NAVIGATION - LIST ITEM ||============================== //

interface Props {
  item: NavItemType;
  level: number;
}

const NavItem = ({ item, level }: Props) => {
  const theme = useTheme();

  const menu = useSelector((state) => state.menu);
  const matchDownLg = useMediaQuery(theme.breakpoints.down("lg"));
  const { drawerOpen, openItem } = menu;

  // const { menuOrientation } = useConfig();
  let itemTarget: LinkTarget = "_self";
  if (item.target) {
    itemTarget = "_blank";
  }

  let listItemProps: {
    component:
      | ForwardRefExoticComponent<RefAttributes<HTMLAnchorElement>>
      | string;
    href?: string;
    target?: LinkTarget;
    // eslint-disable-next-line react/display-name
  } = {
    component: forwardRef((props, ref) => (
      <Link {...props} href={item.url!} target={itemTarget} ref={ref} />
    )),
  };
  if (item?.external) {
    listItemProps = { component: "a", href: item.url, target: itemTarget };
  }

  const Icon = item.icon!;
  const itemIcon = item.icon ? (
    <Icon style={{ fontSize: drawerOpen ? "1rem" : "1.25rem" }} />
  ) : (
    false
  );

  const isSelected = openItem.findIndex((id: any) => id === item.id) > -1;

  const pathname = usePathname();

  // active menu item on page load
  useEffect(() => {
    if (pathname === item.url) {
      dispatch(activeItem({ openItem: [item.id] }));
    }
    // eslint-disable-next-line
  }, [pathname]);

  const textColor = "text.primary";
  const iconSelectedColor = "primary.main";

  return (
    <>
      <ListItemButton
        {...listItemProps}
        disabled={item.disabled}
        selected={isSelected}
        sx={{
          zIndex: 1201,
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          ...(drawerOpen && {
            "&:hover": {
              bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
            },
            "&.Mui-selected": {
              bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
              borderRight: `2px solid ${theme.palette.primary.main}`,
              color: iconSelectedColor,
              "&:hover": {
                color: iconSelectedColor,
                bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
              },
            },
          }),
          ...(!drawerOpen && {
            "&:hover": {
              bgcolor: "transparent",
            },
            "&.Mui-selected": {
              "&:hover": {
                bgcolor: "transparent",
              },
              bgcolor: "transparent",
            },
          }),
        }}
        {...(matchDownLg && {
          onClick: () => dispatch(openDrawer(false)),
        })}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: isSelected ? iconSelectedColor : textColor,
              ...(!drawerOpen && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  bgcolor: "secondary.light",
                },
              }),
              ...(!drawerOpen &&
                isSelected && {
                  bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
                  "&:hover": {
                    bgcolor: `${alpha(theme.palette.primary.light, 0.1)}`,
                  },
                }),
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        {drawerOpen && (
          <ListItemText
            primary={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: isSelected ? iconSelectedColor : textColor,
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 450,
                    fontStyle: "normal",
                    fontSize: "18px",
                    lineHeight: "22px",
                  }}
                >
                  {item.title}
                </Typography>
                {/* <ChevronRightIcon sx={{ fontSize: '20px', color: textColor }} /> */}
              </Box>
            }
          />
        )}
      </ListItemButton>
    </>
  );
};

export default NavItem;
