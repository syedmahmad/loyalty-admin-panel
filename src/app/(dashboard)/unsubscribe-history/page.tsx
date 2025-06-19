"use client"
import React from 'react';
import UnsubscribeTableQuery from './components/UnsubscribeTableQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const UnsubscribeHistory = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <UnsubscribeTableQuery />
    </QueryClientProvider>
  )
}

export default UnsubscribeHistory;
