import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  flightsTransportComparisonFields,
  flightsTransportFilters,
  flightsTransportRecommendations,
  flightsTransportServices,
} from "@/lib/constants/partners/flightsTransportServices";

export default function FlightsTransportComparisonPage() {
  return (
    <PartnerCategoryPage
      title="航空券・移動比較"
      description="日本からNZへの航空券、NZ国内移動、市内移動を、価格、荷物条件、変更可否、アプリ対応で比較できます。"
      categoryPath="/partners/flights-transport"
      services={flightsTransportServices}
      filters={flightsTransportFilters}
      comparisonFields={flightsTransportComparisonFields}
      recommendations={flightsTransportRecommendations}
    />
  );
}
