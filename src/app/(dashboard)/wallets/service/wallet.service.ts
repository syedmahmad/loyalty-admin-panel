import { GET, POST } from "@/utils/AxiosUtility";

export const WalletService = {
  getWallets: (businessUnitId?: number) => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    return GET(`/wallets/${clientInfo.id}`, {
      params: businessUnitId ? { business_unit: businessUnitId } : {},
    });
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
