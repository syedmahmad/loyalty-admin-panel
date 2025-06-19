"use client";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NotFound from "@/components/errors/404";
import { GET } from "@/utils/AxiosUtility";
import { CategoryTableData } from "./CategoryTableData";

const CategoryTableQuery = () => {
  // The QueryClient can be used to interact with a cache. here we need it to refetch
  // again on edit and add and delete.
  const queryClient = useQueryClient();

  const categoriesTokenQuery = useQuery({
    queryKey: ["get-categories-data"],
    queryFn: async () => await GET("/categories", {
      headers: {
        "Content-Type": "application/json",
        "user-token": localStorage.getItem("token"),
      }
    }),
  });

  const reFetchNewClientToken = () => {
    // fetch again so UI update automatically.
    queryClient.invalidateQueries({ queryKey: ["get-categories-data"] });
  };

  if (
    categoriesTokenQuery.isPending
  )
    return "loading...";

  if (categoriesTokenQuery.error || categoriesTokenQuery.data?.status === 404)
    return <NotFound />;
  
  return (
    <CategoryTableData reFetchNewClientToken={reFetchNewClientToken} categoryData={categoriesTokenQuery?.data?.data} />
  );
};

export default CategoryTableQuery;
