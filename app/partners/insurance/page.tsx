import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  insuranceComparisonFields,
  insuranceFilters,
  insuranceRecommendations,
  insuranceServices,
} from "@/lib/constants/partners/insuranceServices";

export default function InsuranceComparisonPage() {
  return (
    <PartnerCategoryPage
      title="海外保険比較"
      description="ニュージーランド渡航前後に確認したい海外保険を、医療補償、携行品、ワーホリ対応などの条件で比較できます。"
      categoryPath="/partners/insurance"
      services={insuranceServices}
      filters={insuranceFilters}
      comparisonFields={insuranceComparisonFields}
      recommendations={insuranceRecommendations}
    />
  );
}
