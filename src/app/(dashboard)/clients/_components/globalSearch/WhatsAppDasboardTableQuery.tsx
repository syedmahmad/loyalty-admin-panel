import NotFound from "@/components/errors/404";
import TableLoader from "@/components/loaders/TableLoader";
import { POST } from "@/utils/AxiosUtility";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { WhatsAppTableData } from "./WhatsAppHistoryData";

export const WhatsAppDasboardTableQuery = () => {
  const [status, setStatus] = useState("3");
  const [gaid, setGaid] = useState("");
  const [isSend, setIsSend] = useState("2");
  const [template, setTemplate] = useState('');

  const localStorgae =
    typeof window !== "undefined" ? window.localStorage : null;
  const clientToken = localStorgae?.getItem("client-secret");

  // The QueryClient can be used to interact with a cache. here we need it to refetch
  // again on edit and add and delete.
  const queryClient = useQueryClient();
  const reFetch = () => {
    // fetch again so UI update automatically.
    queryClient.refetchQueries({ queryKey: ["dashboard-table-query"] });
  };

  // const delay = ms => new Promise(res => setTimeout(res, ms));
  const whatsAppHistoryQuery = useQuery({
    queryKey: ["dashboard-table-query"],
    queryFn: async () =>
      await POST(
        "/whatsapp-history/get-all-for-admin",
        {
          status: status === "3" ? undefined : status,
          user: gaid !== "" ? gaid : undefined,
          isSend: isSend === "2" ? undefined : isSend,
          template: template !== "" ? template : undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${clientToken}`,
          },
        }
      ),
  });

  if (whatsAppHistoryQuery.isPending) return <TableLoader />;

  if (whatsAppHistoryQuery.error || whatsAppHistoryQuery.data?.status === 404)
    return <NotFound />;

  return (
    <WhatsAppTableData
      response={whatsAppHistoryQuery.data}
      status={status}
      setStatus={setStatus}
      gaid={gaid}
      setGaid={setGaid}
      isSend={isSend}
      setIsSend={setIsSend}
      reFetch={reFetch}
      setTemplate={setTemplate}
      template={template}
    />
  );
};
