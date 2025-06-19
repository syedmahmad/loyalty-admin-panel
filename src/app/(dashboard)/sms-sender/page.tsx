"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SMSSendersTemplatesQuery } from "./_components/SMSSendersTemplatesQuery";

const queryClient = new QueryClient();

const Senders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SMSSendersTemplatesQuery />
    </QueryClientProvider>
  );
};

export default Senders;
