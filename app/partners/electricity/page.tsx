import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  electricityComparisonFields,
  electricityFilters,
  electricityRecommendations,
  electricityServices,
} from "@/lib/constants/partners/electricityServices";

export default function ElectricityComparisonPage() {
  return (
    <PartnerCategoryPage
      title="電気サービス比較"
      description="入居後に必要な電気契約を、料金の見方、契約期間、アプリ管理、フラット向きかどうかで比較できます。"
      categoryPath="/partners/electricity"
      services={electricityServices}
      filters={electricityFilters}
      comparisonFields={electricityComparisonFields}
      recommendations={electricityRecommendations}
    />
  );
}
