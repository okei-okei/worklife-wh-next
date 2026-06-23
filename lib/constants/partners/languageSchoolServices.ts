import type { PartnerComparisonField, PartnerFilter, PartnerRecommendation, PartnerService } from "./types";

export const languageSchoolFilters: PartnerFilter[] = [
  { key: "beginner", label: "初心者向け" },
  { key: "ielts", label: "IELTS" },
  { key: "work_support", label: "仕事サポート" },
  { key: "japanese_support", label: "日本語サポート" },
  { key: "international", label: "多国籍環境" },
];

export const languageSchoolComparisonFields: PartnerComparisonField[] = [
  { key: "city", label: "都市", important: true },
  { key: "tuition", label: "学費目安", important: true },
  { key: "courses", label: "コース" },
  { key: "generalEnglish", label: "一般英語" },
  { key: "ielts", label: "IELTS" },
  { key: "jpRatio", label: "日本人比率" },
  { key: "workSupport", label: "仕事サポート" },
  { key: "accommodation", label: "滞在先" },
  { key: "shortTerm", label: "短期" },
  { key: "longTerm", label: "長期" },
];

export const languageSchoolRecommendations: PartnerRecommendation[] = [
  { title: "英語初心者向け", description: "一般英語やサポート体制を重視して確認します。", filterKey: "beginner" },
  { title: "IELTS対策向け", description: "試験対策コースがある学校を比較します。", filterKey: "ielts" },
  { title: "仕事探しも重視する人向け", description: "仕事探しや履歴書サポートの有無を確認します。", filterKey: "work_support" },
  { title: "多国籍環境重視", description: "国籍バランスや都市環境も含めて検討したい人向けです。", filterKey: "international" },
];

export const languageSchoolServices: PartnerService[] = [
  { id: "languages-international", category: "language_school", name: "Languages International", countryCode: "NZ", serviceType: "語学学校", shortDescription: "オークランド中心部で一般英語や試験対策を確認できる学校です。", priceNote: "期間、コース、時期により変わります。", keyFeatures: ["一般英語", "IELTS", "オークランド"], recommendedFor: ["多国籍環境", "IELTS", "長期"], cautions: ["学費、入学金、教材費、滞在先費用を確認してください。"], comparison: { city: "Auckland", tuition: "要見積", courses: "一般英語/試験対策", generalEnglish: true, ielts: true, jpRatio: "要確認", workSupport: "要確認", accommodation: true, shortTerm: true, longTerm: true }, officialUrl: "https://www.languages.ac.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["beginner", "ielts", "international"] },
  { id: "nzlc", category: "language_school", name: "NZLC", countryCode: "NZ", serviceType: "語学学校", shortDescription: "一般英語から試験対策まで幅広く確認できるNZの語学学校です。", priceNote: "コースと週数で変わります。", keyFeatures: ["一般英語", "IELTS", "サポート"], recommendedFor: ["初心者", "IELTS", "日本語サポート重視"], cautions: ["日本語サポートや国籍比率は時期で変わります。"], comparison: { city: "Auckland", tuition: "要見積", courses: "一般英語/IELTS等", generalEnglish: true, ielts: true, jpRatio: "要確認", workSupport: "要確認", accommodation: true, shortTerm: true, longTerm: true }, officialUrl: "https://nzlc.ac.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["beginner", "ielts", "japanese_support"] },
  { id: "worldwide-school", category: "language_school", name: "Worldwide School of English", countryCode: "NZ", serviceType: "語学学校", shortDescription: "オークランドで一般英語や試験対策を確認できます。", priceNote: "コースと期間で変わります。", keyFeatures: ["一般英語", "オークランド", "滞在先"], recommendedFor: ["初心者", "短期集中"], cautions: ["コース開始日と費用内訳を確認してください。"], comparison: { city: "Auckland", tuition: "要見積", courses: "一般英語/試験対策", generalEnglish: true, ielts: "要確認", jpRatio: "要確認", workSupport: "要確認", accommodation: true, shortTerm: true, longTerm: true }, officialUrl: "https://www.worldwideschoolofenglish.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["beginner", "international"] },
  { id: "kaplan-nz", category: "language_school", name: "Kaplan International Languages", countryCode: "GLOBAL", serviceType: "語学学校", shortDescription: "グローバル展開の語学学校。NZ校やコース条件を確認できます。", priceNote: "都市、期間、コースにより変わります。", keyFeatures: ["グローバル", "一般英語", "試験対策"], recommendedFor: ["多国籍環境", "長期"], cautions: ["NZで提供中のコースと校舎情報を確認してください。"], comparison: { city: "要確認", tuition: "要見積", courses: "一般英語/試験対策", generalEnglish: true, ielts: true, jpRatio: "要確認", workSupport: "要確認", accommodation: true, shortTerm: true, longTerm: true }, officialUrl: "https://www.kaplaninternational.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["ielts", "international"] },
  { id: "ec-english", category: "language_school", name: "EC English", countryCode: "GLOBAL", serviceType: "語学学校", shortDescription: "世界各地の語学学校。NZ/周辺国も含めて確認できます。", priceNote: "都市、期間、コースにより変わります。", keyFeatures: ["グローバル", "一般英語", "多国籍"], recommendedFor: ["多国籍環境", "短期集中"], cautions: ["NZでの開講状況とビザ条件を確認してください。"], comparison: { city: "要確認", tuition: "要見積", courses: "一般英語等", generalEnglish: true, ielts: "要確認", jpRatio: "要確認", workSupport: "要確認", accommodation: true, shortTerm: true, longTerm: true }, officialUrl: "https://www.ecenglish.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["beginner", "international"] },
  { id: "lsi-auckland", category: "language_school", name: "LSI Auckland", countryCode: "NZ", serviceType: "語学学校", shortDescription: "オークランドで一般英語や試験対策を確認できます。", priceNote: "期間とコースで変わります。", keyFeatures: ["オークランド", "一般英語", "試験対策"], recommendedFor: ["初心者", "IELTS"], cautions: ["コース内容、滞在先、費用内訳を確認してください。"], comparison: { city: "Auckland", tuition: "要見積", courses: "一般英語/試験対策", generalEnglish: true, ielts: true, jpRatio: "要確認", workSupport: "要確認", accommodation: true, shortTerm: true, longTerm: true }, officialUrl: "https://www.lsi.edu/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["beginner", "ielts", "international"] },
];
