import JsonLd from "@/components/seo/JsonLd";
import { createBreadcrumbJsonLd } from "@/lib/seo";

export default function PartnerBreadcrumbJsonLd({
  label,
  path,
}: {
  label: string;
  path: string;
}) {
  return (
    <JsonLd
      data={createBreadcrumbJsonLd([
        { label: "ホーム", href: "/" },
        { label: "比較・おすすめ", href: "/partners" },
        { label, href: path },
      ])}
    />
  );
}
