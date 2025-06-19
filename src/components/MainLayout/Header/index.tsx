import { ReactNode, useMemo } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { AppBar, Toolbar, useMediaQuery, AppBarProps } from "@mui/material";
import { usePathname } from "next/navigation";
// project import
import AppBarStyled from "./AppBarStyled";
import HeaderContent from "./HeaderContent";
import IconButton from "../../@extended/IconButton";
import Image from "next/image";

import useConfig from "../../../hooks/useConfig";
import { dispatch, useSelector } from "../../../store";
import { openDrawer } from "../../../store/reducers/menu";

import Link from 'next/link';

// assets
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

// types
import { ThemeMode } from "../../../types/config";

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

const Header = () => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));
  const pathname = usePathname();
  // need to hide hamburger menu if clients route is selected.
  const isDashboardMainRoute = pathname === "/clients";

  const menu = useSelector((state) => state.menu);
  const { drawerOpen } = menu;

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const iconBackColorOpen =
    theme.palette.mode === ThemeMode.DARK ? "grey.200" : "grey.300";
  const iconBackColor =
    theme.palette.mode === ThemeMode.DARK ? "background.default" : "grey.100";

  // common header
  const mainHeader: ReactNode = (
    <Toolbar>
      {isDashboardMainRoute ? (
        <Link href="/">
          <Image
            src={"/gogo-motor-logo.svg"}
            alt="logo"
            width={150}
            height={35}
          />
        </Link>
      ) : (
        <IconButton
          aria-label="open drawer"
          onClick={() => dispatch(openDrawer(!drawerOpen))}
          edge="start"
          color="secondary"
          variant="light"
          sx={{
            color: "text.primary",
            bgcolor: isDashboardMainRoute
              ? "transparent"
              : drawerOpen
              ? iconBackColorOpen
              : iconBackColor,
            ml: { xs: 0, lg: -2 },
          }}
        >
          {drawerOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </IconButton>
      )}
      {headerContent}
    </Toolbar>
  );

  // app-bar params
  const appBar: AppBarProps = {
    position: "fixed",
    color: "inherit",
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      zIndex: 1200,
      width: isDashboardMainRoute ? "100%" : drawerOpen ? 'calc(100% - 260px)' : { xs: '100%', lg: 'calc(100% - 60px)' },
      marginBottom:'20px'
    },
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={drawerOpen} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar}>{mainHeader}</AppBar>
      )}
    </>
  );
};

export default Header;
