export type PartnerCategoryKey =
  | "insurance"
  | "bank"
  | "money_transfer"
  | "electricity"
  | "internet"
  | "furniture"
  | "language_school"
  | "flights_transport";

export type PartnerService = {
  id: string;
  category: PartnerCategoryKey;
  name: string;
  countryCode: "NZ" | "AU" | "CA" | "GLOBAL";
  serviceType: string;
  shortDescription: string;
  priceNote?: string;
  keyFeatures: string[];
  recommendedFor: string[];
  cautions: string[];
  comparison: Record<string, string | boolean | number | null>;
  officialUrl: string;
  isAffiliate: boolean;
  affiliateUrl?: string;
  affiliateStatus?: "official" | "available" | "pending" | "none";
  affiliateNetwork?: string;
  affiliateLink?: string;
  lastCheckedAt: string;
  filterTags: string[];
};

export type PartnerFilter = {
  key: string;
  label: string;
};

export type PartnerComparisonField = {
  key: string;
  label: string;
  important?: boolean;
};

export type PartnerRecommendation = {
  title: string;
  description: string;
  filterKey?: string;
};
