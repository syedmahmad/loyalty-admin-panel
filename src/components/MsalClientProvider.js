"use client";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/msalConfig";
export default function MsalClientProvider({ children }) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}