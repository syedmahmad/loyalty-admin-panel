"use client";
import { PublicClientApplication } from "@azure/msal-browser";
const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_NEXT_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/common`,
    redirectUri: process.env.NEXT_PUBLIC_NEXT_REDIRECT_URI,
    navigateToLoginRequestUrl: false,
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin + "/login" : '',
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  },
};
export const msalInstance = new PublicClientApplication(msalConfig);
export const loginRequest = {
  scopes: ["User.Read"],
};