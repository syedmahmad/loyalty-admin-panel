'use client';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { WhatsAppHistoryTableQuery } from './_components/WhatsAppHistoryTableQuery';
const queryClient = new QueryClient();

const WhatsappHistoryPage = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <WhatsAppHistoryTableQuery />
    </QueryClientProvider>
  );
};

export default WhatsappHistoryPage;
