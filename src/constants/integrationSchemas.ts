import type { SchemaField } from "@/types/integration.types";

/**
 * STC Account fields — partner-level identifiers stored in the configuration JSON.
 * These identify the partner's account within STC's system.
 * Shown on the "STC Account" tab in the configuration drawer.
 */
export const ACCOUNT_INFO_SCHEMAS: Record<number, SchemaField[]> = {
  // Partner ID 1 — STC Qitaf
  1: [
    {
      key: "stcPartnerId",
      label: "STC Partner ID",
      type: "text",
      required: true,
      sectionTitle: "STC Account",
      helperText: "e.g. PET001",
      tooltip:
        "Your unique partner identifier assigned by STC during onboarding. " +
        "This is included in every API request header so STC can identify your organisation. " +
        "Contact your STC account manager if you don't have this.",
    },
    {
      key: "organisation",
      label: "Organisation Name",
      type: "text",
      required: true,
      helperText: "Your registered name with STC",
      tooltip:
        "Your organisation's legal or trading name as registered with STC. " +
        "This must match exactly what STC has on file for your account.",
    },
    {
      key: "country",
      label: "Country",
      type: "text",
      required: true,
      helperText: "Country of operation",
      default: "Saudi Arabia",
      tooltip:
        "The country where your Qitaf integration operates. " +
        "Used by STC to scope your transactions to the correct regional system.",
    },
    {
      key: "city",
      label: "City",
      type: "text",
      required: false,
      helperText: "Primary city of operation",
      tooltip:
        "Optional. The primary city where your stores are located. " +
        "Informational only — does not affect API behaviour.",
    },
  ],
};

/**
 * Config form schemas keyed by partner ID.
 * When a new partner is added to the DB, add its ID here with the matching fields.
 */
export const INTEGRATION_SCHEMAS: Record<number, SchemaField[]> = {
  // Partner ID 1 — STC Qitaf
  1: [
    // ─── STC Credentials ─────────────────────────────────────────────────────
    {
      key: "apiBaseUrl",
      label: "API Base URL",
      type: "text",
      required: true,
      format: "url",
      sectionTitle: "STC Credentials",
      helperText: "STC Qitaf web service endpoint URL",
      tooltip:
        "The base URL of STC's Qitaf API server. All API calls (OTP, Redeem, Earn, etc.) " +
        "are sent to this URL. STC provides separate URLs for Staging and Production — " +
        "make sure you use the correct one for the current environment.",
    },
    {
      key: "secretToken",
      label: "Secret Token (X-Secret-Token)",
      type: "text",
      secret: true,
      required: true,
      helperText: "Base64 JWT provided by STC",
      tooltip:
        "A Base64-encoded JWT issued by STC and sent as the X-Secret-Token HTTP header on every API call. " +
        "This is STC's primary way to verify that requests come from your registered system. " +
        "Keep this confidential — treat it like a password.",
    },
    {
      key: "authUsername",
      label: "Auth Username",
      type: "text",
      secret: true,
      required: true,
      helperText: "Basic Auth username provided by STC",
      tooltip:
        "The HTTP Basic Auth username provided by STC. " +
        "Sent as part of the Authorization header on every API call alongside the password. " +
        "STC uses Basic Auth as a second layer of authentication on top of the Secret Token.",
    },
    {
      key: "authPassword",
      label: "Auth Password",
      type: "text",
      secret: true,
      required: true,
      helperText: "Basic Auth password provided by STC",
      tooltip:
        "The HTTP Basic Auth password provided by STC. " +
        "Paired with the Auth Username above to form the Authorization header. " +
        "Keep this confidential and never share it outside the admin panel.",
    },

    // ─── Operational Settings ─────────────────────────────────────────────────
    {
      key: "burnSarPerPoint",
      label: "Burn Rate — SAR per Point",
      type: "number",
      required: true,
      sectionTitle: "Operational Settings",
      helperText: "Current rate: 1 pt = 0.2 SAR (500 pts = 100 SAR)",
      tooltip:
        "How much 1 Qitaf point is worth in SAR at the time of redemption (burn). " +
        "Based on confirmed customer transaction: 500 points were redeemed for 100 SAR, " +
        "so the current value is 0.2 (i.e. 1 point = 0.2 SAR, or 5 points = 1 SAR). " +
        "Used to show the customer their SAR equivalent before they confirm redemption. " +
        "STC may change this rate — update here if they notify you of a change.",
    },
    {
      key: "earnPointsPerSar",
      label: "Earn Rate — Points per SAR",
      type: "number",
      required: true,
      helperText: "Current rate: 0.1 pts/SAR (SAR 65 purchase → 6 pts)",
      tooltip:
        "How many Qitaf points a customer earns per 1 SAR spent (earn/reward). " +
        "Based on confirmed customer SMS: a SAR 65 purchase earned 6 points — " +
        "which matches a rate of 0.1 pts/SAR (65 × 0.1 = 6.5, rounded down to 6 by STC). " +
        "Used to show the customer how many points they will earn before purchase. " +
        "Note: STC performs the actual points calculation on their side — " +
        "this value is for display only and should be updated if STC changes their earn rate.",
    },
    {
      key: "refundPeriodDays",
      label: "Refund Period (days)",
      type: "number",
      required: true,
      helperText: "Points are posted after this window expires",
      tooltip:
        "The number of days STC holds earned points before permanently posting them to the customer's Qitaf balance. " +
        "During this window, points can be reduced via the Update Reward endpoint (e.g. for returns/refunds). " +
        "Once the window expires, points are fully posted and cannot be reduced. " +
        "This value is agreed with STC during your contract setup.",
    },
  ],

  // Partner ID 2 — Al Fursan
  2: [
    // ─── Al Fursan Credentials ────────────────────────────────────────────────
    {
      key: "apiBaseUrl",
      label: "API Base URL",
      type: "text",
      required: true,
      format: "url",
      sectionTitle: "Al Fursan Credentials",
      helperText: "Al Fursan loyalty web service endpoint URL",
      tooltip:
        "The base URL of the Al Fursan loyalty API server. All API calls are sent to this URL. " +
        "Al Fursan provides separate URLs for Staging and Production — " +
        "make sure you use the correct one for the current environment.",
    },
    {
      key: "secretToken",
      label: "Secret Token",
      type: "text",
      secret: true,
      required: true,
      helperText: "Secret token provided by Al Fursan",
      tooltip:
        "The secret token issued by Al Fursan, sent as an authentication header on every API call. " +
        "Keep this confidential — treat it like a password.",
    },
    {
      key: "authUsername",
      label: "Auth Username",
      type: "text",
      secret: true,
      required: true,
      helperText: "Auth username provided by Al Fursan",
      tooltip:
        "The HTTP Basic Auth username provided by Al Fursan. " +
        "Sent as part of the Authorization header on every API call.",
    },
    {
      key: "authPassword",
      label: "Auth Password",
      type: "text",
      secret: true,
      required: true,
      helperText: "Auth password provided by Al Fursan",
      tooltip:
        "The HTTP Basic Auth password provided by Al Fursan. " +
        "Paired with the Auth Username above. Keep this confidential.",
    },

    // ─── Operational Settings ─────────────────────────────────────────────────
    {
      key: "burnSarPerPoint",
      label: "Burn Rate — SAR per Point",
      type: "number",
      required: true,
      sectionTitle: "Operational Settings",
      helperText: "SAR value of 1 Al Fursan mile/point at redemption",
      tooltip:
        "How much 1 Al Fursan point/mile is worth in SAR at the time of redemption. " +
        "Used to show the customer their SAR equivalent before they confirm redemption. " +
        "Update this value if Al Fursan changes their redemption rate.",
    },
    {
      key: "earnPointsPerSar",
      label: "Earn Rate — Points per SAR",
      type: "number",
      required: true,
      helperText: "Al Fursan points earned per 1 SAR spent",
      tooltip:
        "How many Al Fursan points/miles a customer earns per 1 SAR spent. " +
        "Used to show the customer how many points they will earn before purchase. " +
        "Al Fursan performs the actual calculation on their side — " +
        "this value is for display only and should be updated if Al Fursan changes their earn rate.",
    },
    {
      key: "refundPeriodDays",
      label: "Refund Period (days)",
      type: "number",
      required: true,
      helperText: "Points are posted after this window expires",
      tooltip:
        "The number of days Al Fursan holds earned points before permanently posting them. " +
        "During this window, points can be adjusted for returns/refunds. " +
        "This value is agreed with Al Fursan during your contract setup.",
    },
  ],
};
