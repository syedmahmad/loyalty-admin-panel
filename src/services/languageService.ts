import { GET } from "@/utils/AxiosUtility";
import { BaseEntity } from "@/types/common";

export interface Language extends BaseEntity {
  name: string;
  code: string;
  flag: string | null;
}

export interface LanguagesResponse {
  languages: Language[];
  total: number;
  page: number;
  limit: number;
}

export const languageService = {
  getLanguages: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<LanguagesResponse> => {
    const response = await GET("/master/language", { params });
    return response?.data;
  },
};
