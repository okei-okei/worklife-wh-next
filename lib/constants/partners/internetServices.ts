import type { PartnerComparisonField, PartnerFilter, PartnerRecommendation, PartnerService } from "./types";

export const internetFilters: PartnerFilter[] = [
  { key: "budget", label: "安さ重視" },
  { key: "speed", label: "速度重視" },
  { key: "unlimited", label: "データ無制限" },
  { key: "short_term", label: "短期向け" },
  { key: "flat", label: "フラット向け" },
];

export const internetComparisonFields: PartnerComparisonField[] = [
  { key: "monthly", label: "月額目安", important: true },
  { key: "connection", label: "回線タイプ", important: true },
  { key: "speed", label: "速度" },
  { key: "unlimited", label: "無制限", important: true },
  { key: "contractTerm", label: "契約期間" },
  { key: "setupFee", label: "開通費" },
  { key: "router", label: "ルーター" },
  { key: "move", label: "引っ越し" },
  { key: "shortTerm", label: "短期" },
  { key: "flat", label: "フラット" },
];

export const internetRecommendations: PartnerRecommendation[] = [
  { title: "フラット向け", description: "複数人で使う住居向けに無制限や速度を確認できます。", filterKey: "flat" },
  { title: "短期滞在向け", description: "契約期間や解約条件を重視したい人向けです。", filterKey: "short_term" },
  { title: "安さ重視", description: "月額と初期費用を抑えたい人向けです。", filterKey: "budget" },
  { title: "データ無制限重視", description: "動画、通話、仕事で通信量が多い人向けです。", filterKey: "unlimited" },
];

export const internetServices: PartnerService[] = [
  { id: "spark-internet", category: "internet", name: "Spark", countryCode: "NZ", serviceType: "固定/モバイル回線", shortDescription: "NZ大手の通信会社。固定回線やモバイル回線を確認できます。", priceNote: "住所、回線種別、セット契約で変わります。", keyFeatures: ["大手", "固定回線", "モバイル"], recommendedFor: ["速度重視", "長期滞在", "フラット"], cautions: ["住所で利用できる回線を確認してください。"], comparison: { monthly: "要確認", connection: "Fiber/Wireless", speed: "高速プランあり", unlimited: true, contractTerm: "プランによる", setupFee: "要確認", router: "要確認", move: "対応", shortTerm: "要確認", flat: true }, officialUrl: "https://www.spark.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["speed", "unlimited", "flat"] },
  { id: "one-nz-internet", category: "internet", name: "One NZ", countryCode: "NZ", serviceType: "固定/モバイル回線", shortDescription: "固定ブロードバンドとモバイル回線を比較できます。", priceNote: "住所、回線、契約条件で変わります。", keyFeatures: ["大手", "Fiber", "モバイル"], recommendedFor: ["フラット", "速度重視"], cautions: ["契約期間と解約条件を確認してください。"], comparison: { monthly: "要確認", connection: "Fiber/Wireless", speed: "高速プランあり", unlimited: true, contractTerm: "プランによる", setupFee: "要確認", router: "要確認", move: "対応", shortTerm: "要確認", flat: true }, officialUrl: "https://one.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["speed", "unlimited", "flat"] },
  { id: "2degrees-internet", category: "internet", name: "2degrees", countryCode: "NZ", serviceType: "固定/モバイル回線", shortDescription: "コスパと通信プランを比較したい人向けに確認できます。", priceNote: "プランやセット割で変わります。", keyFeatures: ["通信会社", "Fiber", "セット割"], recommendedFor: ["安さ重視", "フラット"], cautions: ["キャンペーン条件を確認してください。"], comparison: { monthly: "要確認", connection: "Fiber/Wireless", speed: "高速プランあり", unlimited: true, contractTerm: "プランによる", setupFee: "要確認", router: "要確認", move: "対応", shortTerm: "要確認", flat: true }, officialUrl: "https://www.2degrees.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["budget", "unlimited", "flat"] },
  { id: "skinny-internet", category: "internet", name: "Skinny", countryCode: "NZ", serviceType: "ブロードバンド", shortDescription: "シンプルで比較的低価格なプランを確認できます。", priceNote: "プラン、回線種別、住所で変わります。", keyFeatures: ["低価格", "シンプル", "オンライン"], recommendedFor: ["安さ重視", "短期検討"], cautions: ["サポートや契約条件を確認してください。"], comparison: { monthly: "比較的低め", connection: "Fiber/4G/5G系", speed: "プランによる", unlimited: true, contractTerm: "要確認", setupFee: "要確認", router: "要確認", move: "対応", shortTerm: true, flat: true }, officialUrl: "https://www.skinny.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["budget", "unlimited", "short_term", "flat"] },
  { id: "slingshot", category: "internet", name: "Slingshot", countryCode: "NZ", serviceType: "ブロードバンド", shortDescription: "家庭向けブロードバンドや電気との組み合わせも確認できます。", priceNote: "住所、回線、セット条件で変わります。", keyFeatures: ["ブロードバンド", "セット", "無制限"], recommendedFor: ["フラット", "料金比較"], cautions: ["セット割や契約期間を確認してください。"], comparison: { monthly: "要確認", connection: "Fiber/ADSL系", speed: "プランによる", unlimited: true, contractTerm: "プランによる", setupFee: "要確認", router: "要確認", move: "対応", shortTerm: "要確認", flat: true }, officialUrl: "https://www.slingshot.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["unlimited", "flat", "budget"] },
  { id: "orcon", category: "internet", name: "Orcon", countryCode: "NZ", serviceType: "ブロードバンド", shortDescription: "速度や無制限プランを重視する住居向けに確認できます。", priceNote: "住所、速度、契約条件で変わります。", keyFeatures: ["Fiber", "無制限", "速度"], recommendedFor: ["速度重視", "フラット"], cautions: ["利用住所での回線対応を確認してください。"], comparison: { monthly: "要確認", connection: "Fiber中心", speed: "高速プランあり", unlimited: true, contractTerm: "プランによる", setupFee: "要確認", router: "要確認", move: "対応", shortTerm: "要確認", flat: true }, officialUrl: "https://www.orcon.net.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["speed", "unlimited", "flat"] },
];
