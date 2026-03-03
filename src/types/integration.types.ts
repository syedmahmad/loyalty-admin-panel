export type IntegrationType = "QITAF" | "AL_FURSAN";

export interface GlobalIntegration {
  id: number;
  name: string;
  type: IntegrationType;
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
  environment: "test" | "production";
  apiBaseUrl: string;
  branchId: string;
  terminalId: string;
  timeoutSeconds: number;
  otpValidityMinutes: number;
  pointToAmountRatio: number;
  refundPeriodDays: number;
  certificateUrl?: string; // stored URL after file upload
  testMsisdn?: string;
  simCardSerial?: string;
}

export type SchemaFieldType = "text" | "number" | "select" | "file" | "textarea";

export interface SchemaField {
  key: string;
  label: string;
  type: SchemaFieldType;
  required?: boolean;
  default?: string | number;
  options?: string[]; // for type: "select"
  accept?: string; // for type: "file"
  showWhen?: { key: string; value: string }; // conditional display
  helperText?: string;
}
