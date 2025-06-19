"use client";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TableLoader from "@/components/loaders/TableLoader";
import NotFound from "@/components/errors/404";
import { GET, POST } from "@/utils/AxiosUtility";
import { ClientsTableData } from "@/app/(dashboard)/clients/_components/ClientsTableData";
import { UnsubscribeHistoryData } from "./UnsubscribeHistory";

const UnsubscribeTableQuery = () => {
  const [ email, setEmail ] = React.useState("");
  const [ number, setNumber ] = React.useState("");
  const [ type, setType ] = React.useState("3");

  // The QueryClient can be used to interact with a cache. here we need it to refetch
  // again on edit and add and delete.
  const queryClient = useQueryClient();

  const UnsubscribeQuery = useQuery({
    queryKey: ["get-all-unsubscribe"],
    queryFn: async () => await POST("/unsubscribe/all", {
      email: email === "" ? undefined : email,
      number: number === "" ? undefined : number,
      type: type === "3" ? undefined : type,
    }, {
      headers: {
        "Content-Type": "application/json",
        "user-token": localStorage.getItem("token"),
      }
    }),
  });

  const reFetchNewClientToken = () => {
    // fetch again so UI update automatically.
    queryClient.invalidateQueries({ queryKey: ["get-all-unsubscribe"] });
  };

  if (UnsubscribeQuery.isPending) return <TableLoader />;

  if (UnsubscribeQuery.error || UnsubscribeQuery.data?.status === 404)
    return <NotFound />;
  
  return (
    <UnsubscribeHistoryData
      response={UnsubscribeQuery.data}
      reFetch={reFetchNewClientToken}
      email={email}
      setEmail={setEmail}
      number={number}
      setNumber={setNumber}
      type={type}
      setType={setType}
    />
  );
};

export default UnsubscribeTableQuery;
