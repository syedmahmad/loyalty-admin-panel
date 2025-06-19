'use client';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { EmailTemplatesQuery } from './_components/EmailTemplatesQuery';

const queryClient = new QueryClient();

const EmailTemplate = () => {

  return (
    <QueryClientProvider client={queryClient}>
        <EmailTemplatesQuery />
    </QueryClientProvider>
  );
};

export default EmailTemplate;
