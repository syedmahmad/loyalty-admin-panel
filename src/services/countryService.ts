import { BaseEntity } from "@/types/common";
import { GET } from "@/utils/AxiosUtility";

export enum OnboardStatus {
  ONBOARDED = "ONBOARDED",
  NOT_ONBOARDED = "NOT_ONBOARDED",
}

export interface Country extends BaseEntity {
  countryId: number;
  name: string;
  native: string;
  iso2: string;
  iso3: string;
}

export interface CountriesResponse {
  countries: Country[];
  total: number;
  page: number;
  limit: number;
}

export const FIELD_NAMES = {
  "%A": "Address",
  "%B": "Building Number",
  "%C": "City",
  "%D": "District",
  "%N": "Neighborhood",
  "%S": "State",
  "%Z": "ZIP",
} as const;

export interface GetCountriesParams {
  page?: number;
  limit?: number;
  search?: string;
  onboardStatus?: OnboardStatus;
}

export const countryService = {
  getCountries: async (
    params: GetCountriesParams = {}
  ): Promise<CountriesResponse> => {
    const { page, limit, search, onboardStatus } = params;

    const queryParams = new URLSearchParams();

    if (page && limit) {
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
    }

    if (search) queryParams.append("search", search);
    if (onboardStatus) queryParams.append("onboardStatus", onboardStatus);

    const response = await GET(`/master/country?${queryParams.toString()}`);
    return response?.data;
  },

  getCountryById: async (countryId: string): Promise<Country> => {
    const response = await GET(`/master/country/${countryId}`);
    return response?.data?.country;
  },
};
