import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  moneyTransferComparisonFields,
  moneyTransferFilters,
  moneyTransferRecommendations,
  moneyTransferServices,
} from "@/lib/constants/partners/moneyTransferServices";

export default function MoneyTransferComparisonPage() {
  return (
    <PartnerCategoryPage
      title="海外送金比較"
      description="日本からニュージーランドへの送金を、手数料、為替レート、着金速度、送金方法で比較できます。"
      categoryPath="/partners/money-transfer"
      services={moneyTransferServices}
      filters={moneyTransferFilters}
      comparisonFields={moneyTransferComparisonFields}
      recommendations={moneyTransferRecommendations}
    />
  );
}
