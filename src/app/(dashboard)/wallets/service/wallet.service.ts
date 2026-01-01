import { GET, POST } from "@/utils/AxiosUtility";

export const WalletService = {
  getWallets: (
    page: number,
    pageSize: number,
    businessUnitId?: number,
    customer_name?: string,
    customer_status?: number | "",
    customer_hashed_number?: string
  ) => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    let queryString = `/wallets/${clientInfo.id}?page=${page}&pageSize=${pageSize}`;

    if (businessUnitId) {
      queryString += `&business_unit=${businessUnitId}`;
    }
    if (customer_name) {
      queryString += `&customer_name=${encodeURIComponent(customer_name)}`;
    }
    if (customer_status !== "" && customer_status !== undefined) {
      queryString += `&customer_status=${customer_status}`;
    }
    if (customer_hashed_number) {
      queryString += `&customer_hashed_number=${encodeURIComponent(
        customer_hashed_number
      )}`;
    }

    return GET(queryString);
  },

  getWalletTransactions: (
    walletId: number,
    page: number,
    pageSize: number,
    searchValue: string
  ) =>
    GET(
      `/wallets/${walletId}/transactions?page=${page}&pageSize=${pageSize}&query=${encodeURIComponent(
        searchValue
      )}`
    ),

  addTransaction: (data: any) => POST("/wallets/transactions", data),

  getSettings: (businessUnitId: number) =>
    GET(`/wallets/settings/${businessUnitId}`),

  getAllWalletSettings: () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    return GET(`/wallets/all-settings/${clientInfo.id}`);
  },

  saveSettings: (data: any) => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    return POST(`/wallets/settings/${clientInfo.id}`, data);
  },

  getBusinessUnits: () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    return GET(`/business-units/${clientInfo.id}`);
  },
};
