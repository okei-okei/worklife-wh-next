import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  internetComparisonFields,
  internetFilters,
  internetRecommendations,
  internetServices,
} from "@/lib/constants/partners/internetServices";

export default function InternetComparisonPage() {
  return (
    <PartnerCategoryPage
      title="インターネット比較"
      description="フラットや一人暮らしで使うホームインターネットを、月額、回線タイプ、無制限、契約期間で比較できます。"
      categoryPath="/partners/internet"
      services={internetServices}
      filters={internetFilters}
      comparisonFields={internetComparisonFields}
      recommendations={internetRecommendations}
    />
  );
}
