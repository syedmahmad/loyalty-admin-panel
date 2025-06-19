"use client";

import { loginRequest } from "@/msalConfig";
import { useMsal } from "@azure/msal-react";
import React, { useState } from "react";
import { useTheme } from "@mui/material";

export default function Microsoft() {
  const { instance } = useMsal();
  const theme = useTheme();
  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  // useEffect(() => {
  //   if (accounts.length > 0) {
  //     setLoggingProcess(true)
  //     validateToken(accounts[0].idToken)
  //   }
  // }, [accounts]);
  

  // const validateToken = useCallback(async (iToken) => {
  //     const token = iToken;
  //     if (token) {
  //         try {
  //           const response = await instance.handleRedirectPromise();
  //           debugger;
  //           if (!response || !response.account) {
  //             toast("No account found in redirect response.");
  //             return router.replace("/login");
  //           }
  //           const account = response?.account || instance.getAllAccounts()[0];
  //           if (!account) {
  //             toast("No account found after login.");
  //             return router.push("/login");
  //           }
    
  //           const idToken = response?.idToken;
    
  //           const res = await POST("users/validateToken", { token: idToken });
  //           debugger;
  //           if (res?.data?.token) {
  //             dispatch(setUserLogin(res.data));
  //             router.replace("/clients");
  //           } else {
  //             toast("Token validation failed.");
  //             localStorage.clear();
  //             router.replace("/login");
  //           }
  //         } catch (error) {
  //           toast(err?.response?.data?.message || "Login failed.");
  //           localStorage.clear();
  //           router.replace("/login");
  //         }
  //     }
  // }, [])

  // console.log("/?////////////////////////////////",);
  // console.log("/?////////////////////////////////",);
  // console.log("/?////////////////////////////////",accounts);
  return (
    <>
    <span style={{ color: theme.palette.primary.main, cursor: 'pointer', fontWeight: '700' }} onClick={handleLogin}>
          Login with Microsoft
        </span>
    {/* { accounts[0]?.length ? <span style={{ color: theme.palette.primary.main, cursor: 'pointer', fontWeight: '700' }}>
          Processing login...
        </span> :  */}
        
    </>
  );
}