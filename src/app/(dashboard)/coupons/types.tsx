export type ConditionField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export type CouponFormValues = {
  exception_error_message_ar: string;
  exception_error_message_en: string;
  general_error_message_ar: string;
  general_error_message_en: string;
  discount_price: number;
  discount_percentage: number;
  code: string;
  coupon_type: string;
  usage_limit: number;
  business_unit_ids: number[];
  date_from: string;
  date_to: string;
  once_per_customer?: number;
  is_active: boolean;
  benefits: string;
  conditions: {
    [key: string]: any;
  };
  errors: {
    [key: string]: string;
  };
};

export type BusinessUnit = {
  id: number;
  name: string;
};

export type Tier = {
  id: number;
  name: string;
  min_points: number;
  points_conversion_rate: number;
  benefits?: string;
  business_unit?: { name: string };
};
