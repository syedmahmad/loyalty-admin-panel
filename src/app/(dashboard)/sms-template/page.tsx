'use client';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SMSTemplatesQuery } from './_components/SMSTemplatesQuery';

const queryClient = new QueryClient();

const SMSTemplate = () => {

  return (
    <QueryClientProvider client={queryClient}>
        <SMSTemplatesQuery />
    </QueryClientProvider>
  );
};

export default SMSTemplate;
