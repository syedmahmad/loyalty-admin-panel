import { GET } from "@/utils/AxiosUtility";
import { BaseEntity } from "@/types/common";

export interface Currency extends BaseEntity {
  name: string;
  code: string;
  symbol: string;
  flag: string;
}

export interface CurrenciesResponse {
  currencies: Currency[];
  total: number;
  page: number;
  limit: number;
}

export const currencyService = {
  getCurrencies: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    onboardStatus?: string;
  }): Promise<CurrenciesResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.onboardStatus)
      queryParams.append("onboardStatus", params.onboardStatus);

    const url = `/master/currency${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;
    const response = await GET(url);
    return response?.data;
  },
};
