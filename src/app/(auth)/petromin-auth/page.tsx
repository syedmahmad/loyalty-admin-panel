"use client";
import {Suspense, useEffect} from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { Box, Card, CardContent, Container, Divider, Skeleton, useTheme } from "@mui/material";
import { toast } from "react-toastify";
import { POST } from "@/utils/AxiosUtility";
import { setUserLogin, setUserLogout } from "@/store/reducers";
import { dispatch } from "@/store";
import Grid2 from "@mui/material/Unstable_Grid2";
import ClientsLoader from "@/components/loaders/ClientsLoader";

const PetrominAuth = () => {
  const { instance, accounts } = useMsal();
    const theme = useTheme();
    const router = useRouter();

  useEffect(() => {
    const processRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (!response || !response.account) {
          toast("No account found in redirect response.");
          return router.replace("/login");
        }
        const account = response?.account || instance.getAllAccounts()[0];
        if (!account) {
          toast("No account found after login.");
          return router.push("/login");
        }

        const idToken = response?.idToken;

        const res = await POST("users/validateToken", { token: idToken }, {
          withCredentials: true, // 👈 critical for cookies
        });

        if (res?.data?.token) {
          dispatch(setUserLogin(res.data));
          router.replace("/clients");
        } else {
          toast("Token validation failed.");
          dispatch(setUserLogout());
          setTimeout(() => {
            instance.logoutRedirect({
              postLogoutRedirectUri: window.location.origin + "/login",
              // account: instance.getActiveAccount(), // Optional, explicitly logs out the current user
            });
          }, 2500);
        }
      } catch (err: any) {
        toast(err?.response?.data?.message || "Login failed.");
        dispatch(setUserLogout());
        setTimeout(() => {
          instance.logoutRedirect({
            postLogoutRedirectUri: window.location.origin + "/login",
            // account: instance.getActiveAccount(), // Optional, explicitly logs out the current user
          });
        }, 2500);
      }
    };

    processRedirect();
  }, []);

    return (
      <ClientsLoader />
    );
}

export default PetrominAuth;