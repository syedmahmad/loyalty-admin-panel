"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ClientsTableQuery from "@/app/(dashboard)/tenants/_components/ClientsTableQuery";

const queryClient = new QueryClient();

const ClientPage = () => {
  // const user = JSON.parse(
  //   localStorage.getItem("user") || "{}"
  // )
  // const ALLOWED_EMAILS = [
  //   'muzaffar.uzaman@petromin.com',
  //   'amit.joshi@petromin.com',
  //   'syed.muhammed@petromin.com',
  // ];

  // const isAllowed = ALLOWED_EMAILS.includes(user?.email?.toLowerCase() || '');

  return (
    <QueryClientProvider client={queryClient}>
      <ClientsTableQuery />
    </QueryClientProvider>
  );
};

export default ClientPage;
