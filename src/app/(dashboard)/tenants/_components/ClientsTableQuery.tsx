"use client";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NotFound from "@/components/errors/404";
import { GET } from "@/utils/AxiosUtility";
import { ClientsTableData } from "@/app/(dashboard)/tenants/_components/ClientsTableData";
import ClientsLoader from "@/components/loaders/ClientsLoader";

const ClientsTableQuery = () => {
  // The QueryClient can be used to interact with a cache. here we need it to refetch
  // again on edit and add and delete.
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();
  const clientTokenQuery = useQuery({
    queryKey: ["get-tenants-data"],
    queryFn: async () =>
      await GET("/tenants", {
        headers: {
          "Content-Type": "application/json",
          "user-secret": token,
        },
      }),
  });

  const reFetchNewClientToken = () => {
    // fetch again so UI update automatically.
    queryClient.invalidateQueries({ queryKey: ["get-tenants-data"] });
  };

  if (clientTokenQuery.isPending) return <ClientsLoader />;

  if (clientTokenQuery.error || clientTokenQuery.data?.status === 404)
    return <NotFound />;

  return (
    <ClientsTableData
      clientData={clientTokenQuery.data?.data}
      reFetchNewClientToken={reFetchNewClientToken}
    />
  );
};

export default ClientsTableQuery;
