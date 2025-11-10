import { BusinessUnit } from "@/types/businessunit.type";
import { GET } from "@/utils/AxiosUtility";

export const businessUnitService = {
  getBusinessUnit: async (): Promise<BusinessUnit[]> => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const response = await GET(`/business-units/${clientInfo.id}`);
    if (response?.status !== 200) {
      throw new Error("Failed to fetch business units");
    }
    return response.data;
  },
};
