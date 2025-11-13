export type OfferFormValues = {
  offerBasicInfo: {
    locales: Record<
      string,
      {
        title: string;
        subtitle: string;
        description: string;
        term_and_condition: string;
        desktop_image: string;
        mobile_image: string;
        benefits: any;
      }
    >;
  };
  business_unit_ids: number[];
  date_from: string;
  date_to: string;
  status: number;
  benefits: string;
  customer_segment_ids: number[];
  all_users: number;
  file?: any;
  station_type: string;
  show_in_app: number;
};

export type BusinessUnit = {
  id: number;
  name: string;
};
