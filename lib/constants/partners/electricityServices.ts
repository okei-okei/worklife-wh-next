import type { PartnerComparisonField, PartnerFilter, PartnerRecommendation, PartnerService } from "./types";

export const electricityFilters: PartnerFilter[] = [
  { key: "short_term", label: "短期向け" },
  { key: "long_term", label: "長期向け" },
  { key: "flat", label: "フラット向け" },
  { key: "app", label: "アプリ管理" },
  { key: "compare_price", label: "料金比較向け" },
];

export const electricityComparisonFields: PartnerComparisonField[] = [
  { key: "dailyCharge", label: "基本料金", important: true },
  { key: "usageRate", label: "電力量料金", important: true },
  { key: "contractTerm", label: "契約期間" },
  { key: "breakFee", label: "解約手数料" },
  { key: "online", label: "オンライン契約", important: true },
  { key: "app", label: "アプリ管理" },
  { key: "move", label: "引っ越し" },
  { key: "flat", label: "フラット向き" },
  { key: "single", label: "一人暮らし" },
  { key: "billing", label: "請求の分かりやすさ" },
];

export const electricityRecommendations: PartnerRecommendation[] = [
  { title: "フラット生活向け", description: "複数人で請求を確認しやすい選択肢を見たい人向けです。", filterKey: "flat" },
  { title: "短期滞在向け", description: "契約期間や解約条件を重視して比較したい人向けです。", filterKey: "short_term" },
  { title: "アプリで管理したい人向け", description: "使用量や請求をオンラインで見たい人向けです。", filterKey: "app" },
  { title: "料金を比較したい人向け", description: "基本料金と従量料金の両方を確認したい人向けです。", filterKey: "compare_price" },
];

export const electricityServices: PartnerService[] = [
  { id: "contact-energy", category: "electricity", name: "Contact Energy", countryCode: "NZ", serviceType: "電力会社", shortDescription: "NZ大手の電力会社。電気やガス、インターネットとのセットも確認できます。", priceNote: "地域、住居、使用量、プランで変わります。", keyFeatures: ["大手", "オンライン契約", "複数サービス"], recommendedFor: ["長期滞在", "フラット生活"], cautions: ["住所ごとの料金と契約条件を確認してください。"], comparison: { dailyCharge: "要確認", usageRate: "要確認", contractTerm: "プランによる", breakFee: "要確認", online: true, app: true, move: "対応", flat: true, single: true, billing: "標準" }, officialUrl: "https://contact.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["long_term", "flat", "app"] },
  { id: "mercury", category: "electricity", name: "Mercury", countryCode: "NZ", serviceType: "電力会社", shortDescription: "電気、ガス、通信などを確認できるNZ大手サービスです。", priceNote: "住所とプランにより異なります。", keyFeatures: ["大手", "アプリ", "オンライン管理"], recommendedFor: ["長期滞在", "アプリ管理"], cautions: ["キャンペーン条件や契約期間を確認してください。"], comparison: { dailyCharge: "要確認", usageRate: "要確認", contractTerm: "プランによる", breakFee: "要確認", online: true, app: true, move: "対応", flat: true, single: true, billing: "標準" }, officialUrl: "https://www.mercury.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["long_term", "app", "flat"] },
  { id: "genesis-energy", category: "electricity", name: "Genesis Energy", countryCode: "NZ", serviceType: "電力会社", shortDescription: "NZ大手の電力会社。家庭向けプランを確認できます。", priceNote: "地域と契約条件で変わります。", keyFeatures: ["大手", "家庭向け", "オンライン"], recommendedFor: ["長期滞在", "一人暮らし"], cautions: ["料金プランと解約条件を比較してください。"], comparison: { dailyCharge: "要確認", usageRate: "要確認", contractTerm: "プランによる", breakFee: "要確認", online: true, app: true, move: "対応", flat: true, single: true, billing: "標準" }, officialUrl: "https://www.genesisenergy.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["long_term", "app"] },
  { id: "electric-kiwi", category: "electricity", name: "Electric Kiwi", countryCode: "NZ", serviceType: "電力会社", shortDescription: "オンライン管理や料金比較を重視したい人が確認しやすい電力会社です。", priceNote: "住所と利用時間帯で変わります。", keyFeatures: ["オンライン", "料金比較", "アプリ"], recommendedFor: ["料金比較", "アプリ管理"], cautions: ["時間帯別条件や最新プランを確認してください。"], comparison: { dailyCharge: "要確認", usageRate: "要確認", contractTerm: "要確認", breakFee: "要確認", online: true, app: true, move: "対応", flat: true, single: true, billing: "比較しやすい" }, officialUrl: "https://www.electrickiwi.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["compare_price", "app", "flat"] },
  { id: "flick-electric", category: "electricity", name: "Flick Electric", countryCode: "NZ", serviceType: "電力会社", shortDescription: "市場連動型など料金の仕組みを比較したい人向けに確認できます。", priceNote: "市場価格やプランで変動します。", keyFeatures: ["料金比較", "オンライン", "使用量確認"], recommendedFor: ["料金比較", "電気代を細かく見たい人"], cautions: ["価格変動リスクと請求条件を確認してください。"], comparison: { dailyCharge: "要確認", usageRate: "変動あり", contractTerm: "要確認", breakFee: "要確認", online: true, app: true, move: "対応", flat: "要確認", single: true, billing: "細かい" }, officialUrl: "https://www.flickelectric.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["compare_price", "app"] },
  { id: "powershop", category: "electricity", name: "Powershop", countryCode: "NZ", serviceType: "電力会社", shortDescription: "アプリやオンラインで電気代を管理したい人向けに確認できます。", priceNote: "地域と使用量で変わります。", keyFeatures: ["アプリ", "オンライン管理", "料金確認"], recommendedFor: ["アプリ管理", "フラット生活"], cautions: ["プラン内容と支払い条件を確認してください。"], comparison: { dailyCharge: "要確認", usageRate: "要確認", contractTerm: "要確認", breakFee: "要確認", online: true, app: true, move: "対応", flat: true, single: true, billing: "見やすい" }, officialUrl: "https://www.powershop.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["app", "flat", "compare_price"] },
];
