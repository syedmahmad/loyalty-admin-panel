import { GET, POST } from "@/utils/AxiosUtility";

export const WalletService = {
  getWallets: (businessUnitId?: number) =>
    GET("/wallets", {
      params: businessUnitId ? { business_unit: businessUnitId } : {},
    }),

  getWalletTransactions: (walletId: number, page: number, pageSize: number) =>
    GET(`/wallets/${walletId}/transactions?page=${page}&pageSize=${pageSize}`),

  addTransaction: (data: any) => POST("/wallets/transactions", data),

  getSettings: (businessUnitId: number) =>
    GET(`/wallets/settings/${businessUnitId}`),

  saveSettings: (data: any) => POST("/wallets/settings", data),

  getBusinessUnits: () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    return GET(`/business-units/${clientInfo.id}`);
  },
};
