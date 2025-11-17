type LocaleValue = {
  name?: string;
  description?: string;
};

export type LocalesState = Record<string | number, LocaleValue>;
