import type { SchemaField } from "@/types/integration.types";

/**
 * Config form schemas keyed by partner ID.
 * When a new partner is added to the DB, add its ID here with the matching fields.
 */
export const INTEGRATION_SCHEMAS: Record<number, SchemaField[]> = {
  // Partner ID 1 — STC Qitaf
  1: [
    // ─── CSR Generation ──────────────────────────────────────────────────────
    {
      key: "qitafPartnerId",
      label: "Qitaf Partner ID",
      type: "text",
      required: false,
      sectionTitle: "CSR Generation",
      helperText: "Unique partner identifier assigned by STC (used in certificate CN)",
    },
    {
      key: "country",
      label: "Country Code",
      type: "text",
      required: false,
      helperText: "Two-letter ISO country code (e.g. SA)",
    },
    {
      key: "city",
      label: "City",
      type: "text",
      required: false,
      helperText: "City used in the certificate CSR",
    },
    {
      key: "organisation",
      label: "Organisation",
      type: "text",
      required: false,
      helperText: "Organisation name used in the certificate CSR",
    },

    // ─── STC Credentials ─────────────────────────────────────────────────────
    {
      key: "secretToken",
      label: "Secret Token (X-Secret-Token)",
      type: "text",
      required: true,
      sectionTitle: "STC Credentials",
      helperText: "Base64-encoded JWT provided by STC — sent as X-Secret-Token header",
    },
    {
      key: "authUsername",
      label: "Auth Username",
      type: "text",
      required: true,
      helperText: "Basic Auth username provided by STC",
    },
    {
      key: "authPassword",
      label: "Auth Password",
      type: "text",
      required: true,
      helperText: "Basic Auth password provided by STC",
    },
    {
      key: "certificateFile",
      label: "SSL Client Certificate",
      type: "file",
      accept: ".pem,.crt,.cer",
      required: false,
      helperText: "Upload the signed certificate (.pem/.crt) received from STC after submitting your CSR",
    },
    {
      key: "privateKeyFile",
      label: "Private Key",
      type: "file",
      accept: ".pem,.key",
      required: false,
      helperText: "Upload the private key file (.pem/.key) generated during CSR creation",
    },

    // ─── Operational Settings ─────────────────────────────────────────────────
    {
      key: "environment",
      label: "Environment",
      type: "select",
      options: ["test", "production"],
      required: true,
      sectionTitle: "Operational Settings",
      helperText: "Select 'test' during development and UAT phases",
    },
    {
      key: "apiBaseUrl",
      label: "API Base URL",
      type: "text",
      required: true,
      helperText: "STC Qitaf web service endpoint URL",
    },
    {
      key: "timeoutSeconds",
      label: "Redemption Timeout (seconds)",
      type: "number",
      required: true,
      default: 60,
      helperText: "STC mandate: 60s. If no response, call Reverse automatically",
    },
    {
      key: "otpValidityMinutes",
      label: "OTP Validity (minutes)",
      type: "number",
      required: true,
      default: 3,
      helperText: "Qitaf OTP expires after 3 minutes",
    },
    {
      key: "pointToAmountRatio",
      label: "Points to SAR Ratio",
      type: "number",
      required: true,
      helperText: "Amount-to-QitafPoint ratio agreed with STC",
    },
    {
      key: "refundPeriodDays",
      label: "Refund Period (days)",
      type: "number",
      required: true,
      helperText: "Points are posted after this refund window expires",
    },

    // ─── Test Settings ────────────────────────────────────────────────────────
    {
      key: "testMsisdn",
      label: "Test Mobile Number (STC GSM)",
      type: "text",
      sectionTitle: "Test Settings",
      showWhen: { key: "environment", value: "test" },
      helperText: "Consumer STC number (without 966 country code)",
    },
    {
      key: "simCardSerial",
      label: "SIM Card Serial Number",
      type: "text",
      showWhen: { key: "environment", value: "test" },
      helperText: "18-digit serial printed on SIM card (from mySTC app)",
    },
  ],

  // Partner ID 2 — Al Fursan
  2: [
    {
      key: "environment",
      label: "Environment",
      type: "select",
      options: ["test", "production"],
      required: true,
      helperText: "Select 'test' during development and UAT phases",
    },
    {
      key: "apiBaseUrl",
      label: "API Base URL",
      type: "text",
      required: true,
      helperText: "Al Fursan loyalty web service endpoint URL",
    },
    {
      key: "partnerId",
      label: "Partner ID",
      type: "text",
      required: true,
      helperText: "Provided by Al Fursan after registration",
    },
    {
      key: "apiKey",
      label: "API Key",
      type: "text",
      required: true,
      helperText: "API key for authenticating with Al Fursan services",
    },
    {
      key: "pointToMileRatio",
      label: "Points to Mile Ratio",
      type: "number",
      required: true,
      helperText: "Conversion ratio between loyalty points and Al Fursan miles",
    },
    {
      key: "timeoutSeconds",
      label: "Request Timeout (seconds)",
      type: "number",
      required: true,
      default: 60,
      helperText: "Maximum wait time before considering a request failed",
    },
  ],
};
