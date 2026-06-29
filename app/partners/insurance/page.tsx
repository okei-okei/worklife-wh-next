import InsuranceComparison from "@/components/partners/InsuranceComparison";
import PartnerBreadcrumbJsonLd from "@/components/seo/PartnerBreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリ向け海外保険比較 | WorkLife WH",
  description:
    "ニュージーランドのワーホリ・留学・旅行に備える海外保険を、補償内容やサポート条件で比較できます。",
  path: "/partners/insurance",
});

export default function InsuranceComparisonPage() {
  return (
    <>
      <PartnerBreadcrumbJsonLd label="海外保険" path="/partners/insurance" />
      <InsuranceComparison />
    </>
  );
}
