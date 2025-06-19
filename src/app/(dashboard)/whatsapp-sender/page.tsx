"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WhatsappSenderQuery } from "./_components/WhatsappSenderQuery";

const queryClient = new QueryClient();

const Senders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WhatsappSenderQuery />
    </QueryClientProvider>
  );
};

export default Senders;
