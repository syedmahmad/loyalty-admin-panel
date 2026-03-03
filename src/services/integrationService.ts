import { GET, POST, PATCH, DELETE } from "@/utils/AxiosUtility";
import type { GlobalIntegration, IntegrationType } from "@/types/integration.types";

// Map backend snake_case Partner entity → frontend GlobalIntegration
const toGlobal = (p: any): GlobalIntegration => ({
  id: p.id,
  name: p.name,
  type: p.type as IntegrationType,
  description: p.description,
  logoUrl: p.logo_url,
  isActive: p.is_active === 1,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

export const integrationService = {
  getAll: async (): Promise<GlobalIntegration[]> => {
    const response = await GET("/partners");
    if (response?.status !== 200) throw new Error("Failed to fetch partners");
    return (response.data as any[]).map(toGlobal);
  },

  create: async (payload: Partial<GlobalIntegration>): Promise<GlobalIntegration> => {
    const response = await POST("/partners", {
      name: payload.name,
      type: payload.type,
      description: payload.description,
      logo_url: payload.logoUrl,
    });
    if (response?.status !== 201) throw new Error("Failed to create partner");
    return toGlobal(response.data);
  },

  update: async (id: number, payload: Partial<GlobalIntegration>): Promise<GlobalIntegration> => {
    const response = await PATCH(`/partners/${id}`, {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.type !== undefined && { type: payload.type }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.logoUrl !== undefined && { logo_url: payload.logoUrl }),
      ...(payload.isActive !== undefined && { is_active: payload.isActive ? 1 : 0 }),
    });
    if (response?.status !== 200) throw new Error("Failed to update partner");
    return toGlobal(response.data);
  },

  remove: async (id: number): Promise<void> => {
    const response = await DELETE(`/partners/${id}`);
    if (response?.status !== 200) throw new Error("Failed to remove partner");
  },
};
