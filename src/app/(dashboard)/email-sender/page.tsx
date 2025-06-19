"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmailSendersTemplatesQuery } from "./_components/EmailSendersTemplatesQuery";

const queryClient = new QueryClient();

const Senders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <EmailSendersTemplatesQuery />
    </QueryClientProvider>
  );
};

export default Senders;
