export type VisaPointCategory = {
  category: string;
  available: number;
  details: string;
  scored?: number;
};

export type VisaType = {
  name: string;
  description: string;
  baseScore: number;
  minFunds: number;
  points: VisaPointCategory[];
};

export type CountryVisaTypes = {
  study: VisaType;
  work: VisaType;
  permanent: VisaType;
};

export type CountryData = {
  visaTypes: CountryVisaTypes;
  processingTime: {
    study: string;
    work: string;
    permanent: string;
  };
};

export type CountryDataMap = {
  [key: string]: CountryData;
};

export type RecommendationResult = {
  name: string;
  score: number;
  requirements: string[];
  processingTime: string;
  visaTypes: {
    name: string;
    description: string;
    points: VisaPointCategory[];
    requiredFunds: {
      base: number;
      spouse: number;
      perDependent: number;
    };
  }[];
  fundsRequired: number;
  dependentFunds: {
    spouse: number;
    perDependent: number;
  };
  eligibilityReason: string;
  isEligible: boolean;
};