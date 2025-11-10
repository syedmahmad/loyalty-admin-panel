export type Tier = {
  id: number;
  tierBasicInfo: {
    locales: Record<
      string,
      {
        name: string;
        description: string;
        benefits: any;
      }
    >;
  };
  min_points: string;
  benefits: string;
  description: string;
  business_unit_id?: string;
};

export interface TierBenefit {
  name_en: string;
  name_ar?: string;
  name_hi?: string;
  name_bn?: string;
  icon?: string;
}

export interface TierFormValues {
  tierBasicInfo: {
    locales: Record<
      string,
      {
        name: string;
        description: string;
        benefits: any;
      }
    >;
  };
  min_points: string;
  benefits: string;
  description: string;
  business_unit_ids: number[];
}

export interface TierLocale {
  name: string;
  description: string;
  benefits: TierBenefit[];
}

export interface TierBasicInfo {
  locales: Record<string, TierLocale>; // keyed by languageId
}

export interface TierData {
  name: string;
  min_points: number;
  business_unit_id: string;
  tierBasicInfo: TierBasicInfo;
}

export type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
};
