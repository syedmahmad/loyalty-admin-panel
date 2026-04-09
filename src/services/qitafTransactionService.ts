import { GET } from "@/utils/AxiosUtility";

export interface QitafTransaction {
  id: number;
  uuid: string;
  tenant_id: number;
  partner_id: number;
  msisdn: number;
  transaction_type: "otp" | "redeem" | "reverse" | "earn" | "earn_incentive" | "update" | "status";
  global_id: string | null;
  ref_request_id: string | null;
  ref_request_date: string | null;
  branch_id: string | null;
  terminal_id: string | null;
  amount: number | null;
  cashier_id: string | null;
  reduction_amount: number | null;
  points: number | null;
  status: "success" | "failed" | "auto_reversed";
  stc_response: Record<string, any> | null;
  stc_error: Record<string, any> | null;
  request_date: string | null;
  created_at: string;
}

export interface QitafTransactionsResult {
  data: QitafTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

export const qitafTransactionService = {
  getByCustomer: async (
    customerId: number,
    page = 1,
    limit = 10,
  ): Promise<QitafTransactionsResult> => {
    const response = await GET(
      `/qitaf/transactions/by-customer/${customerId}?page=${page}&limit=${limit}`,
    );
    if (response?.status !== 200) throw new Error("Failed to fetch Qitaf transactions");
    return response.data;
  },

  getAll: async (
    tenantId: number,
    msisdn?: string,
    page = 1,
    limit = 10,
  ): Promise<QitafTransactionsResult> => {
    let url = `/qitaf/transactions/all/${tenantId}?page=${page}&limit=${limit}`;
    if (msisdn) url += `&msisdn=${encodeURIComponent(msisdn)}`;
    const response = await GET(url);
    if (response?.status !== 200) throw new Error("Failed to fetch Qitaf transactions");
    return response.data;
  },
};
