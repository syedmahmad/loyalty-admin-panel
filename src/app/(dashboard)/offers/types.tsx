export type OfferFormValues = {
  offer_title: string;
  offer_title_ar: string;
  business_unit_ids: number[];
  date_from: string;
  date_to: string;
  status: number;
  benefits: string;
  customer_segment_ids: number[];
  description_en: string;
  description_ar: string;
  all_users: number;
  file?: any;
};

export type BusinessUnit = {
  id: number;
  name: string;
};
