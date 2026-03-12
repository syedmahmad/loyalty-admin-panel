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
  // CSR Generation (stored for reference)
  qitafPartnerId?: string;
  country?: string;
  city?: string;
  organisation?: string;

  // Credentials from STC
  secretToken?: string;
  authUsername?: string;
  authPassword?: string;
  certificateUrl?: string;
  privateKeyUrl?: string;

  // Operational
  environment: "test" | "production";
  apiBaseUrl: string;
  timeoutSeconds: number;
  otpValidityMinutes: number;
  pointToAmountRatio: number;
  refundPeriodDays: number;

  // Test only
  testMsisdn?: string;
  simCardSerial?: string;
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
  showWhen?: { key: string; value: string };
  helperText?: string;
  sectionTitle?: string;
}
