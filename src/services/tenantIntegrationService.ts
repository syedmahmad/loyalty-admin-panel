import { GET, POST, PATCH, DELETE } from "@/utils/AxiosUtility";
import type { TenantIntegrationConfig } from "@/types/integration.types";

// Map backend snake_case TenantPartnerIntegration entity → frontend TenantIntegrationConfig
const toConfig = (r: any): TenantIntegrationConfig => ({
  id: r.id,
  tenantId: r.tenant_id,
  integrationId: r.partner_id,
  isEnabled: r.is_enabled === 1,
  configuration: r.configuration ?? {},
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const tenantIntegrationService = {
  getByTenant: async (tenantId: number): Promise<TenantIntegrationConfig[]> => {
    const response = await GET(`/tenant-integrations/by-tenant/${tenantId}`);
    if (response?.status !== 200) throw new Error("Failed to fetch tenant integrations");
    return (response.data as any[]).map(toConfig);
  },

  create: async (payload: {
    tenantId: number;
    integrationId: number;
    isEnabled: boolean;
    configuration: Record<string, unknown>;
  }): Promise<TenantIntegrationConfig> => {
    const response = await POST("/tenant-integrations", {
      tenant_id: payload.tenantId,
      partner_id: payload.integrationId,
      configuration: payload.configuration,
    });
    if (response?.status !== 201) throw new Error("Failed to create tenant integration");
    return toConfig(response.data);
  },

  update: async (
    id: number,
    payload: Partial<{ isEnabled: boolean; configuration: Record<string, unknown> }>
  ): Promise<TenantIntegrationConfig> => {
    const response = await PATCH(`/tenant-integrations/${id}`, {
      ...(payload.isEnabled !== undefined && { is_enabled: payload.isEnabled ? 1 : 0 }),
      ...(payload.configuration !== undefined && { configuration: payload.configuration }),
    });
    if (response?.status !== 200) throw new Error("Failed to update tenant integration");
    return toConfig(response.data);
  },

  toggleEnabled: async (
    id: number,
    isEnabled: boolean
  ): Promise<TenantIntegrationConfig> => {
    return tenantIntegrationService.update(id, { isEnabled });
  },

  remove: async (id: number): Promise<void> => {
    const response = await DELETE(`/tenant-integrations/${id}`);
    if (response?.status !== 200) throw new Error("Failed to remove tenant integration");
  },

  // Certificate upload — no file storage backend yet; kept as a stub
  uploadCertificate: async (file: File): Promise<{ url: string }> => {
    return { url: `pending_upload://${file.name}` };
  },
};
