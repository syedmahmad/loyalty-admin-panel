export interface GlobalIntegration {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantIntegrationConfig {
  id: number;
  tenantId: number;
  integrationId: number;
  integration?: GlobalIntegration;
  isEnabled: boolean;
  configuration: QitafConfig | Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface QitafConfig {
  // STC Account
  stcPartnerId: string;
  organisation: string;
  country: string;
  city?: string;

  // Credentials from STC
  secretToken: string;
  authUsername: string;
  authPassword: string;

  // Operational
  apiBaseUrl: string;
  /** SAR value of 1 Qitaf point at redemption. Current: 0.2 (500 pts = 100 SAR) */
  burnSarPerPoint: number;
  /** Points earned per 1 SAR spent. Current: 0.1 (SAR 65 → 6 pts, rounded down) */
  earnPointsPerSar: number;
  refundPeriodDays: number;
}

export interface TerminalMapping {
  id: number;
  uuid: string;
  tenantPartnerIntegrationId: number;
  branchId: string;
  terminalId: string;
  label?: string;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SchemaFieldType = "text" | "number" | "select" | "file" | "textarea";

export interface SchemaField {
  key: string;
  label: string;
  type: SchemaFieldType;
  required?: boolean;
  default?: string | number;
  options?: string[];
  accept?: string;
  /** Renders as a masked password input with show/hide toggle and copy button */
  secret?: boolean;
  /** When set to "url", adds URL format validation on top of the required check */
  format?: "url";
  showWhen?: { key: string; value: string };
  helperText?: string;
  /** Tooltip shown on the label info icon — use for richer explanation than helperText */
  tooltip?: string;
  sectionTitle?: string;
}
