import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  furnitureComparisonFields,
  furnitureFilters,
  furnitureRecommendations,
  furnitureServices,
} from "@/lib/constants/partners/furnitureServices";

export default function FurnitureComparisonPage() {
  return (
    <PartnerCategoryPage
      title="家具・生活用品比較"
      description="到着直後に必要な寝具、キッチン用品、家具、家電を、新品・中古・配送条件で比較できます。"
      categoryPath="/partners/furniture"
      services={furnitureServices}
      filters={furnitureFilters}
      comparisonFields={furnitureComparisonFields}
      recommendations={furnitureRecommendations}
    />
  );
}
