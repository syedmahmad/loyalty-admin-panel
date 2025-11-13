export type ConditionField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export type CouponFormValues = {
  couponBasicInfo: {
    locales: Record<
      string,
      {
        title: string;
        description: string;
        term_and_condition: string;
        desktop_image: string;
        mobile_image: string;
        general_error: string;
        exception_error: string;
        benefits: any;
      }
    >;
  };
  discount_price: number;
  upto_amount: number;
  code: string;
  coupon_type: string;
  discount_type: string;
  usage_limit: number;
  max_usage_per_user: number;
  business_unit_ids: number[];
  date_from: string;
  date_to: string;
  validity_after_assignment?: number | string;
  once_per_customer?: number;
  reuse_interval?: number;
  is_point_earning_disabled?: number;
  status: number;
  customer_segment_ids: number[];
  conditions: {
    [key: string]: any;
  };
  errors?: {
    [key: string]: string;
  };
  all_users: number;
  file?: any;
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

export type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
  drawerType?: string;
};
