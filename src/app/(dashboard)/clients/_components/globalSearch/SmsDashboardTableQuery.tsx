'use client';
import React, { useState } from 'react';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import TableLoader from '@/components/loaders/TableLoader';
import NotFound from '@/components/errors/404';
import { POST } from '@/utils/AxiosUtility';
import { DashboardTableData } from '@/app/(dashboard)/clients/_components/globalSearch/SmsDashboardTableData';

const SMSTableQuery = () => {


  const[gaid,setGaid] = useState('');
  const [template, setTemplate] = useState('');

  const localStorgae = typeof window !== 'undefined' ? window.localStorage : null;
  const clientToken = localStorgae?.getItem('client-secret');

   // The QueryClient can be used to interact with a cache. here we need it to refetch
    // again on edit and add and delete.
    const queryClient = useQueryClient();
    const reFetch = () => {
      // fetch again so UI update automatically.
      queryClient.refetchQueries({ queryKey: ['dashboard-table-query'] });
    }

    // const delay = ms => new Promise(res => setTimeout(res, ms));
    const smsHistoryQuery = useQuery({
      queryKey: ['dashboard-table-query'],
      queryFn: async () => await POST('/sms-history/get-all', {
        user: gaid,
        template: template !== "" ? template : undefined,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${clientToken}`
        }
      })
    });

    if (smsHistoryQuery.isPending) return <TableLoader />

    if (smsHistoryQuery.error || smsHistoryQuery.data?.status === 404) return <NotFound />


  return (
    <DashboardTableData
      response={smsHistoryQuery.data}
      gaid={gaid}
      setGaid={setGaid}
      reFetch={reFetch}
      setTemplate={setTemplate}
      template={template}
    />
  );
};

export default SMSTableQuery;
