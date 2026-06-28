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
      noticeText="掲載サービスには広告・紹介リンクが含まれる場合があります。電気料金、契約条件、提供エリア、解約手数料は変更される場合があるため、必ず公式サイトで最新情報をご確認ください。"
    />
  );
}
