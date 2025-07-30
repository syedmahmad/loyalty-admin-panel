// src/components/MicrosoftButton.tsx
'use client';

import { Button } from "@mui/material";
import Image from "next/image";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/msalConfig";
import logo4 from "@/assets/images/micro.svg"; // adjust the path if needed

export default function MicrosoftButton() {
  const { instance } = useMsal();

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
  //             router.replace("/tenants");
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
    <Button
      fullWidth
      variant="contained"
      onClick={handleLogin}
      startIcon={
        <Image
          src={logo4}
          alt="Microsoft Logo"
          width={20}
          height={20}
        />
      }
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        textTransform: "none",
        fontSize: "17px",
        borderRadius: "12px",
        px: 4,
        py: 1.5,
        maxWidth: 320,
        "&:hover": {
          backgroundColor: "#000",
          color: "#fff",
        },
      }}
    >
      Continue with Microsoft
    </Button>
  );
}

