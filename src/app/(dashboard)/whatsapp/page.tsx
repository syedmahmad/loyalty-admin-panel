"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WhatsappTemplateQuery } from "./_components/WhatsappTemplateQuery";
const queryClient = new QueryClient();

const Whatsapp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WhatsappTemplateQuery />
    </QueryClientProvider>
  );
};

export default Whatsapp;
