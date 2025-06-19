'use client';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import EmailHistoryQuery from './_components/EmailHistoryTableQuery'
const queryClient = new QueryClient();

const EmailHistoryPage = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <EmailHistoryQuery />
    </QueryClientProvider>
  );
};

export default EmailHistoryPage;
