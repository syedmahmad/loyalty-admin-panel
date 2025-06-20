import { ReactNode, SyntheticEvent, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Box,
  ButtonBase,
  CardContent,
  Grid,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

// project import
import ProfileTab from "./ProfileTab";
import Avatar from "../../../../@extended/Avatar";
import IconButton from "../../../../@extended/IconButton";

// assets
import avatar1 from "../../../../../assets/images/users/avatar-1.png";
import { LogoutOutlined } from "@ant-design/icons";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";

// types
import { ThemeMode } from "../../../../../types/config";
import { setUserLogout } from "@/store/reducers";
import { dispatch, useSelector } from "@/store";
import { useMsal } from "@azure/msal-react";

interface TabPanelProps {
  children?: ReactNode;
  dir?: string;
  index: number;
  value: number;
}

// tab panel wrapper
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

// function a11yProps(index: number) {
//     return {
//         id: `profile-tab-${index}`,
//         'aria-controls': `profile-tabpanel-${index}`
//     };
// }

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
  const theme = useTheme();
  const router = useRouter();
  const { instance, accounts } = useMsal();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anchorRef = useRef<any>(null);
  const user = useSelector((state) => state.user);

  const handleLogout = async () => {
    const confirmed = window.confirm("Do you really want to log out?");
    if (!confirmed) return;
  
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin + "/login", // Ensure it's an absolute URI
      });
  
      // Manually check MSAL accounts (should be empty)
      const accounts = instance.getAllAccounts();
      if (accounts.length === 0) {
        dispatch(setUserLogout());
        router.push('/login');
      } else {
        console.warn("Logout completed but account still exists in cache:", accounts);
        await instance.clearCache(); // Fallback in case something is stuck
        dispatch(setUserLogout());
        router.push('/login');
      }
    } catch (error) {
      console.error("Logout failed or was cancelled:", error);
    }
  };
  
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const iconBackColorOpen =
    theme.palette.mode === ThemeMode.DARK ? "grey.200" : "grey.300";

  const pathname = usePathname();
  const clientName = localStorage.getItem("client-name");
  const shouldShowClientName = pathname !== "/" && pathname !== "/tenants";

  const downMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      {downMd && shouldShowClientName && <ClientInfo clientName={clientName} />}

      {!downMd && shouldShowClientName && (
        <Box
          sx={{
            marginRight: 2,
            background: "rgba(247, 241, 247, 1)",
            width: "246px",
            padding: "0px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ButtonBase
            sx={{
              borderRadius: 1,
              "&:hover": {
                bgcolor:
                  theme.palette.mode === ThemeMode.DARK
                    ? "secondary.light"
                    : "secondary.light",
              },
              "&:focus-visible": {
                outline: `2px solid ${theme.palette.secondary.dark}`,
                outlineOffset: 2,
              },
              p: 1,
            }}
            ref={anchorRef}
            aria-label="open profile"
            aria-controls={open ? "profile-grow" : undefined}
            aria-haspopup="true"
          >
            <Stack
              direction="row" // Changed to row for horizontal layout
              alignItems="center"
              justifyContent="space-between" // Spreads content across available space
              sx={{ width: "100%" }}
              spacing={4}
            >
              {/* Left Side - Client Name */}
              <Box>
                <Typography>Client Name</Typography>
                <Tooltip title={clientName || ""} arrow>
                  <Typography
                    variant="h3"
                    color={theme.palette.primary.dark}
                    textTransform="capitalize"
                  >
                    {clientName &&
                      (clientName.length > 15
                        ? clientName.slice(0, 9) + "..."
                        : clientName)}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>
          </ButtonBase>
          {/* Right Side - Icon */}
          <IconButton size="small" onClick={() => router.push("/tenants")}>
            <GridViewOutlinedIcon
              sx={{ fontSize: 18, color: "secondary.dark" }}
            />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          flexShrink: 0,
          ml: 0.75,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ButtonBase
          sx={{
            p: 0.25,
            bgcolor: open ? iconBackColorOpen : "transparent",
            borderRadius: 1,
            "&:hover": {
              bgcolor:
                theme.palette.mode === ThemeMode.DARK
                  ? "secondary.light"
                  : "secondary.light",
            },
            "&:focus-visible": {
              outline: `2px solid ${theme.palette.secondary.dark}`,
              outlineOffset: 2,
            },
          }}
          ref={anchorRef}
          aria-label="open profile"
          aria-controls={open ? "profile-grow" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ p: 0.5 }}
          >
            {/* @ts-expect-error know error */}
            <Avatar  sx={{ backgroundColor: theme.palette.primary.lighter }} src={avatar1} size="xs" />
            <Typography variant="subtitle1">
              {user?.first_name}
              {/* {[user?.first_name, user?.last_name].filter(Boolean).join(" ")} */}
            </Typography>
          </Stack>
        </ButtonBase>
        <Popover
          open={open}
          onClose={handleClose}
          anchorEl={anchorRef.current}
          anchorReference="anchorEl"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          role={undefined}
          disablePortal
        >
          <Paper
            sx={{
              boxShadow: theme.shadows[1],
              width: 290,
              minWidth: 240,
              maxWidth: 290,
              [theme.breakpoints.down("md")]: {
                maxWidth: 250,
              },
            }}
          >
            <CardContent sx={{ px: 2.5, pt: 3 }}>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {/* @ts-expect-error know error */}
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: theme.palette.primary.lighter,}} src={avatar1}
                    />
                    <Stack>
                      <Typography variant="h6">
                        {user?.first_name}
                        {/* {[user?.first_name, user?.last_name]
                          .filter(Boolean)
                          .join(" ")} */}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                {/* <Grid item>
                  <Tooltip title="Logout">
                    <IconButton
                      size="large"
                      sx={{ color: "text.primary" }}
                      onClick={handleLogout}
                    >
                      <LogoutOutlined />
                    </IconButton>
                  </Tooltip>
                </Grid> */}
              </Grid>
            </CardContent>
            <TabPanel value={value} index={0} dir={theme.direction}>
              <ProfileTab handleLogout={handleLogout} />
            </TabPanel>
          </Paper>
        </Popover>
      </Box>
    </>
  );
};

export default Profile;

const ClientInfo = ({ clientName }: { clientName: string | null }) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box
      sx={{
        background: "rgba(247, 241, 247, 1)",
        width: "246px",
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Tooltip title={clientName} arrow>
      <Typography  variant="h6" color={theme.palette.primary.dark} textTransform="capitalize" >
        {clientName &&
          (clientName.length > 15 ? clientName.slice(0, 9) + "..." : clientName)}
      </Typography>
      </Tooltip>
      <Tooltip title="View All Clients" placement="top" arrow>
        <GridViewOutlinedIcon
          sx={{
            fontSize: 18,
            color: theme.palette.secondary.dark,
            cursor: "pointer",
          }}
          onClick={() => router.push("/tenants")}
        />
      </Tooltip>
    </Box>
  );
};
