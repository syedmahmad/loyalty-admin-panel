"use client"
import React from "react";
import CategoryTableQuery from "./components/CategoryTableQuery";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Categories = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <CategoryTableQuery />
    </QueryClientProvider>
  )
}

export default Categories;