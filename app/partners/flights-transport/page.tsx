import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import RelatedArticles from "@/components/articles/RelatedArticles";
import PartnerBreadcrumbJsonLd from "@/components/seo/PartnerBreadcrumbJsonLd";
import { getStaticArticleBySlug } from "@/lib/constants/articles";
import {
  flightsTransportComparisonFields,
  flightsTransportFilters,
  flightsTransportRecommendations,
  flightsTransportServices,
} from "@/lib/constants/partners/flightsTransportServices";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリ向け航空券・移動手段比較 | WorkLife WH",
  description:
    "日本からNZへの航空券、到着後の空港移動、NZ国内移動、市内交通を比較できます。",
  path: "/partners/flights-transport",
});

export default function FlightsTransportComparisonPage() {
  const relatedArticles = [
    getStaticArticleBySlug("nz-working-holiday-flights-transport-guide"),
  ].filter((article) => article !== null);

  return (
    <>
      <PartnerBreadcrumbJsonLd
        label="航空券・移動"
        path="/partners/flights-transport"
      />
      <PartnerCategoryPage
        title="航空券・移動比較"
        description="日本からNZへの航空券、NZ国内移動、市内移動を、価格、荷物条件、変更可否、アプリ対応で比較できます。"
        categoryPath="/partners/flights-transport"
        services={flightsTransportServices}
        filters={flightsTransportFilters}
        comparisonFields={flightsTransportComparisonFields}
        recommendations={flightsTransportRecommendations}
      >
        <RelatedArticles articles={relatedArticles} />
      </PartnerCategoryPage>
    </>
  );
}
