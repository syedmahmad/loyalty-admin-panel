export type OfferFormValues = {
  offer_title: string;
  offer_title_ar: string;
  offer_subtitle: string;
  offer_subtitle_ar: string;
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
  station_type: string;
  show_in_app: number;
};

export type BusinessUnit = {
  id: number;
  name: string;
};
