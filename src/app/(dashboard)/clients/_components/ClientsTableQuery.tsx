"use client";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TableLoader from "@/components/loaders/TableLoader";
import NotFound from "@/components/errors/404";
import { GET } from "@/utils/AxiosUtility";
import { ClientsTableData } from "@/app/(dashboard)/clients/_components/ClientsTableData";
import ClientsLoader from "@/components/loaders/ClientsLoader";

const InspectionTableQuery = ({
  openEmailSearch,
  setOpenEmailSearch,
  openSmsSearch,
  setOpenSmsSearch,
  handleCloseSmsSearch,
  handleCloseEmailSearch,
  openWhatsAppSearch,
  handleCloseWhatsAppSearch,
  setOpenWhatsAppSearch
}: any) => {
  // The QueryClient can be used to interact with a cache. here we need it to refetch
  // again on edit and add and delete.
  const queryClient = useQueryClient();

  const clientTokenQuery = useQuery({
    queryKey: ["get-clients-data"],
    queryFn: async () => await GET("/client/get-all", {
      headers: {
        "Content-Type": "application/json",
        "user-token": localStorage.getItem("token"),
      }
    }),
  });

  const smsAverageTime = useQuery({
    queryKey: ["get-sms-average-time"],
    queryFn: async () => await GET("/sms-history/get-average-time"),
  });

  const emailAverageTime = useQuery({
    queryKey: ["get-email-average-time"],
    queryFn: async () => await GET("/mails-history/get-average-time"),
  });

  const whatsappAverageTime = useQuery({
    queryKey: ["get-whatapp-average-time"],
    queryFn: async () => await GET("/whatsapp-history/get-average-time"),
  });

  const reFetchNewClientToken = () => {
    // fetch again so UI update automatically.
    queryClient.invalidateQueries({ queryKey: ["get-clients-data"] });
  };

  if (
    clientTokenQuery.isPending ||
    smsAverageTime.isPending ||
    emailAverageTime.isPending ||
    whatsappAverageTime.isPending
  )
    return <ClientsLoader />;

  if (clientTokenQuery.error || clientTokenQuery.data?.status === 404)
    return <NotFound />;

  return (
    <ClientsTableData
      smsAverageTime={smsAverageTime.data?.data}
      emailAverageTime={emailAverageTime.data?.data}
      whatsappAverageTime={whatsappAverageTime.data?.data}
      clientData={clientTokenQuery.data?.data}
      reFetchNewClientToken={reFetchNewClientToken}
      openEmailSearch={openEmailSearch}
      handleCloseEmailSearch={handleCloseEmailSearch}
      openSmsSearch={openSmsSearch}
      handleCloseSmsSearch={handleCloseSmsSearch}
      openWhatsAppSearch={openWhatsAppSearch}
      handleCloseWhatsAppSearch={handleCloseWhatsAppSearch}
      setOpenEmailSearch={setOpenEmailSearch}
      setOpenSmsSearch={setOpenSmsSearch}
      setOpenWhatsAppSearch={setOpenWhatsAppSearch}
    />
  );
};

export default InspectionTableQuery;
