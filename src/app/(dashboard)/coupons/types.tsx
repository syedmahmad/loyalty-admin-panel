export type ConditionField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export type CouponFormValues = {
  coupon_title: string;
  exception_error_message_ar: string;
  exception_error_message_en: string;
  general_error_message_ar: string;
  general_error_message_en: string;
  discount_price: number;
  discount_percentage: number;
  code: string;
  coupon_type: string;
  usage_limit: number;
  max_usage_per_user: number;
  business_unit_ids: number[];
  date_from: string;
  date_to: string;
  validity_after_assignment:number
  once_per_customer?: number;
  reuse_interval?: number;
  status: number;
  benefits: string;
  conditions: {
    [key: string]: any;
  };
  errors?: {
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

export type Make = { MakeId: number; Make: string };
export type Model = { ModelId: number; Model: string };
export type Variant = { TrimId: number; Trim: string };

export type dynamicRows = {
  year?: string;
  id: number;
  type: string;
  operator: string;
  value: string;
  tier?: number;
  make?: number;
  model?: number;
  // variant?: number;
  variant?: (number | string)[];
  models?: Model[];
  variants?: Variant[];
};
