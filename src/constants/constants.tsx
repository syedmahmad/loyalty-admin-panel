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
    type: "TIME_LIMITED",
  },
  {
    id: 4,
    type: "PRODUCT_SPECIFIC",
  },
  {
    id: 5,
    type: "GEO_TARGETED",
  },
  {
    id: 6,
    type: "USAGE_BASED",
  },
  {
    id: 7,
    type: "BIRTHDAY",
  },
  {
    id: 8,
    type: "REFERRAL",
  },
  {
    id: 9,
    type: "TIER_BASED",
  },
  {
    id: 10,
    type: "CASHBACK",
  },
  {
    id: 11,
    type: "DISCOUNT",
  },
];

export const COUPON_TYPE = {
  DISCOUNT: "DISCOUNT",
  CASHBACK: "CASHBACK",
  TIER_BASED: "TIER_BASED",
  REFERRAL: "REFERRAL",
  BIRTHDAY: "BIRTHDAY",
  USAGE_BASED: "USAGE_BASED",
  GEO_TARGETED: "GEO_TARGETED",
  PRODUCT_SPECIFIC: "PRODUCT_SPECIFIC",
  TIME_LIMITED: "TIME_LIMITED",
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
    USAGE_BASED: "Used to offer discount after specific usage count.",
    GEO_TARGETED: "Apply discount based on user's location.",
    PRODUCT_SPECIFIC: "Applies percentage discount to specific products.",
    TIME_LIMITED: "Valid within the specified time window.",
  },
  discountPrice: {
    DISCOUNT:
      "Enter a fixed discount value (e.g., 100 for ₹100 off). Leave blank if using percentage.",
    CASHBACK: "This is the cashback amount the user receives after purchase.",
    REFERRAL: "Fixed cashback or reward amount for referral.",
    TIER_BASED: "Not used here — discount comes from tier mapping.",
    BIRTHDAY: "Fixed discount for birthday-related purchases.",
    USAGE_BASED: "Fixed discount after Nth usage.",
    GEO_TARGETED: "Flat discount based on user’s location.",
    PRODUCT_SPECIFIC: "Flat amount discount for specific products.",
    TIME_LIMITED: "Flat discount available within the active period.",
  },
};
