import type { SchemaField } from "@/types/integration.types";

/**
 * Config form schemas keyed by partner ID.
 * When a new partner is added to the DB, add its ID here with the matching fields.
 */
export const INTEGRATION_SCHEMAS: Record<number, SchemaField[]> = {
  // Partner ID 1 — STC Qitaf
  1: [
    // ─── STC Credentials ─────────────────────────────────────────────────────
    {
      key: "secretToken",
      label: "Secret Token (X-Secret-Token)",
      type: "text",
      secret: true,
      required: true,
      sectionTitle: "STC Credentials",
      helperText: "Base64-encoded JWT provided by STC — sent as X-Secret-Token header",
    },
    {
      key: "authUsername",
      label: "Auth Username",
      type: "text",
      secret: true,
      required: true,
      helperText: "Basic Auth username provided by STC",
    },
    {
      key: "authPassword",
      label: "Auth Password",
      type: "text",
      secret: true,
      required: true,
      helperText: "Basic Auth password provided by STC",
    },

    // ─── Operational Settings ─────────────────────────────────────────────────
    {
      key: "apiBaseUrl",
      label: "API Base URL",
      type: "text",
      required: true,
      format: "url",
      sectionTitle: "Operational Settings",
      helperText: "STC Qitaf web service endpoint URL",
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
  ],

  // Partner ID 2 — Al Fursan
  2: [
    // ─── Al Fursan Credentials ────────────────────────────────────────────────
    {
      key: "secretToken",
      label: "Secret Token",
      type: "text",
      secret: true,
      required: true,
      sectionTitle: "Al Fursan Credentials",
      helperText: "Secret token provided by Al Fursan",
    },
    {
      key: "authUsername",
      label: "Auth Username",
      type: "text",
      secret: true,
      required: true,
      helperText: "Auth username provided by Al Fursan",
    },
    {
      key: "authPassword",
      label: "Auth Password",
      type: "text",
      secret: true,
      required: true,
      helperText: "Auth password provided by Al Fursan",
    },

    // ─── Operational Settings ─────────────────────────────────────────────────
    {
      key: "apiBaseUrl",
      label: "API Base URL",
      type: "text",
      required: true,
      format: "url",
      sectionTitle: "Operational Settings",
      helperText: "Al Fursan loyalty web service endpoint URL",
    },
    {
      key: "pointToAmountRatio",
      label: "Points to SAR Ratio",
      type: "number",
      required: true,
      helperText: "Amount-to-point ratio agreed with Al Fursan",
    },
    {
      key: "refundPeriodDays",
      label: "Refund Period (days)",
      type: "number",
      required: true,
      helperText: "Points are posted after this refund window expires",
    },
  ],
};
