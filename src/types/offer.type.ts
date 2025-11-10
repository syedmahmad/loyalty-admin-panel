export type UploadingState = {
  desktop: Record<string, boolean>;
  mobile: Record<string, boolean>;
};

export type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
  drawerType?: string;
};
