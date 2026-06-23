import PartnerCategoryPage from "@/components/partners/PartnerCategoryPage";
import {
  languageSchoolComparisonFields,
  languageSchoolFilters,
  languageSchoolRecommendations,
  languageSchoolServices,
} from "@/lib/constants/partners/languageSchoolServices";

export default function LanguageSchoolComparisonPage() {
  return (
    <PartnerCategoryPage
      title="語学学校比較"
      description="ニュージーランドの語学学校を、都市、コース、IELTS対策、仕事探しサポート、滞在先サポートで比較できます。"
      categoryPath="/partners/language-school"
      services={languageSchoolServices}
      filters={languageSchoolFilters}
      comparisonFields={languageSchoolComparisonFields}
      recommendations={languageSchoolRecommendations}
    />
  );
}
