import { GET } from "@/utils/AxiosUtility";

export const tenantService = {
  getTenantById: async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const response = await GET(`/tenants/${clientInfo.id}`);
    console.log("response:::", response);
    if (response?.status !== 200) {
      throw new Error("Failed to fetch tenant info");
    }
    return response.data;
  },
};
