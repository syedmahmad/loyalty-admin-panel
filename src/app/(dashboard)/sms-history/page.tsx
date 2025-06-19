'use client';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import SMSHistoryTableQuery from '@/app/(dashboard)/sms-history/_components/DashboardTableQuery';
const queryClient = new QueryClient();

const SMSHistoryPage = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <SMSHistoryTableQuery />
    </QueryClientProvider>
  );
};

export default SMSHistoryPage;
