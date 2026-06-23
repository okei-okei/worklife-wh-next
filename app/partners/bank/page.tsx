import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  bankComparisonFields,
  bankFilters,
  bankRecommendations,
  bankServices,
} from "@/lib/constants/partners/bankServices";

export default function BankComparisonPage() {
  return (
    <PartnerCategoryPage
      title="銀行口座比較"
      description="NZ到着後の給与受取や生活費管理に使う銀行口座、送金と相性のよい補助サービスを比較できます。"
      categoryPath="/partners/bank"
      services={bankServices}
      filters={bankFilters}
      comparisonFields={bankComparisonFields}
      recommendations={bankRecommendations}
    />
  );
}
