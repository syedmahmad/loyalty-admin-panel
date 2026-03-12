import { GET, POST, PATCH, DELETE } from "@/utils/AxiosUtility";
import type { TerminalMapping } from "@/types/integration.types";

const toTerminal = (r: any): TerminalMapping => ({
  id: r.id,
  uuid: r.uuid,
  tenantPartnerIntegrationId: r.tenant_partner_integration_id,
  branchId: r.branch_id,
  terminalId: r.terminal_id,
  label: r.label ?? "",
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const terminalService = {
  getByIntegration: async (integrationId: number): Promise<TerminalMapping[]> => {
    const response = await GET(`/tenant-partner-terminals/by-integration/${integrationId}`);
    if (response?.status !== 200) throw new Error("Failed to fetch terminals");
    return (response.data as any[]).map(toTerminal);
  },

  create: async (payload: {
    tenantPartnerIntegrationId: number;
    branchId: string;
    terminalId: string;
    label?: string;
  }): Promise<TerminalMapping> => {
    const response = await POST("/tenant-partner-terminals", {
      tenant_partner_integration_id: payload.tenantPartnerIntegrationId,
      branch_id: payload.branchId,
      terminal_id: payload.terminalId,
      label: payload.label,
    });
    if (response?.status !== 201) throw new Error("Failed to create terminal");
    return toTerminal(response.data);
  },

  bulkCreate: async (
    tenantPartnerIntegrationId: number,
    terminals: Array<{ branchId: string; terminalId: string; label?: string }>
  ): Promise<{ created: number; skipped: number }> => {
    const response = await POST("/tenant-partner-terminals/bulk", {
      tenant_partner_integration_id: tenantPartnerIntegrationId,
      terminals: terminals.map((t) => ({
        branch_id: t.branchId,
        terminal_id: t.terminalId,
        label: t.label,
      })),
    });
    if (response?.status !== 201) throw new Error("Failed to bulk create terminals");
    return response.data;
  },

  update: async (
    id: number,
    payload: Partial<{ branchId: string; terminalId: string; label: string; isActive: number }>
  ): Promise<TerminalMapping> => {
    const response = await PATCH(`/tenant-partner-terminals/${id}`, {
      ...(payload.branchId !== undefined && { branch_id: payload.branchId }),
      ...(payload.terminalId !== undefined && { terminal_id: payload.terminalId }),
      ...(payload.label !== undefined && { label: payload.label }),
      ...(payload.isActive !== undefined && { is_active: payload.isActive }),
    });
    if (response?.status !== 200) throw new Error("Failed to update terminal");
    return toTerminal(response.data);
  },

  remove: async (id: number): Promise<void> => {
    const response = await DELETE(`/tenant-partner-terminals/${id}`);
    if (response?.status !== 200) throw new Error("Failed to remove terminal");
  },
};
