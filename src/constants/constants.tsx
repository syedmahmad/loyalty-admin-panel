export const COUPON_TYPE_ARRAY = [
  {
    id: 1,
    type: "VEHICLE_SPECIFIC",
  },
  {
    id: 2,
    type: "USER_SPECIFIC",
  },
  {
    id: 3,
    type: "PRODUCT_SPECIFIC",
  },
  {
    id: 4,
    type: "GEO_TARGETED",
  },
  {
    id: 5,
    type: "SERVICE_BASED",
  },
  {
    id: 6,
    type: "BIRTHDAY",
  },
  {
    id: 7,
    type: "REFERRAL",
  },
  {
    id: 8,
    type: "TIER_BASED",
  },
  {
    id: 9,
    type: "CASHBACK",
  },
  {
    id: 10,
    type: "DISCOUNT",
  },
];

export const COUPON_TYPE = {
  DISCOUNT: "DISCOUNT",
  CASHBACK: "CASHBACK",
  TIER_BASED: "TIER_BASED",
  REFERRAL: "REFERRAL",
  BIRTHDAY: "BIRTHDAY",
  SERVICE_BASED: "SERVICE_BASED",
  GEO_TARGETED: "GEO_TARGETED",
  PRODUCT_SPECIFIC: "PRODUCT_SPECIFIC",
  USER_SPECIFIC: "USER_SPECIFIC",
  VEHICLE_SPECIFIC: "VEHICLE_SPECIFIC",
};

export const tooltipMessages: {
  discountPercentage: { [key: string]: string };
  discountPrice: { [key: string]: string };
} = {
  discountPercentage: {
    DISCOUNT:
      "Enter a percentage-based discount (e.g., 10 for 10% off). Leave blank if using fixed amount.",
    CASHBACK: "This field is ignored for cashback. Leave it as 0.",
    TIER_BASED: "Not required. Discount is defined per user tier.",
    REFERRAL: "Optional: Used when offering percentage-based rewards.",
    BIRTHDAY: "Set the percentage discount for birthday offers.",
    SERVICE_BASED: "Used to offer discount after specific usage",
    GEO_TARGETED: "Apply discount based on user's location.",
    PRODUCT_SPECIFIC: "Applies percentage discount to specific products.",
  },
  discountPrice: {
    DISCOUNT:
      "Enter a fixed discount value (e.g., 100 for ₹100 off). Leave blank if using percentage.",
    CASHBACK: "This is the cashback amount the user receives after purchase.",
    REFERRAL: "Fixed cashback or reward amount for referral.",
    TIER_BASED: "Not used here — discount comes from tier mapping.",
    BIRTHDAY: "Fixed discount for birthday-related purchases.",
    SERVICE_BASED: "Fixed discount",
    GEO_TARGETED: "Flat discount based on user’s location.",
    PRODUCT_SPECIFIC: "Flat amount discount for specific products.",
  },
};

export const tooltipMessagesValidityAfterAssignment =
  "How many days the coupon remains valid after it’s assigned to a user. Leave blank for no validity period.";

export const discountTypes = [
  { name: "Fixed Discount", value: "fixed_discount" },
  { name: "Percentage Discount", value: "percentage_discount" },
];
export const tooltipMessagesValidityAfterAssignmentForRule =
  "How many days the rule remains valid after it’s assigned to a user. Leave blank for no validity period.";

export const FREQUENCY = [
  {
    label: "Once",
    value: "once",
  },
  {
    label: "Anytime",
    value: "anytime",
  },
  {
    label: "Yearly",
    value: "yearly",
  },
];

export const CAMPAIGN_TYPES = [
  {
    label: "DISCOUNT_POINTS",
    value: "DISCOUNT_POINTS",
  },
  {
    label: "DISCOUNT_COUPONS",
    value: "DISCOUNT_COUPONS",
  },
];

export const BURN_TYPES = [
  {
    label: "FIXED",
    value: "FIXED",
  },
  {
    label: "PERCENTAGE",
    value: "PERCENTAGE",
  },
];

export const REWARD_CONDITIONS = [
  {
    label: "Per Amount",
    value: "perAmount",
  },
  {
    label: "Minimum Spend",
    value: "minimum",
  },
];
