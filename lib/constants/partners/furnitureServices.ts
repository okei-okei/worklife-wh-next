import type { PartnerComparisonField, PartnerFilter, PartnerRecommendation, PartnerService } from "./types";

export const furnitureFilters: PartnerFilter[] = [
  { key: "budget", label: "安さ重視" },
  { key: "new", label: "新品" },
  { key: "used", label: "中古" },
  { key: "delivery", label: "配送あり" },
  { key: "arrival", label: "到着直後向け" },
];

export const furnitureComparisonFields: PartnerComparisonField[] = [
  { key: "priceRange", label: "価格帯", important: true },
  { key: "condition", label: "新品/中古", important: true },
  { key: "delivery", label: "配送" },
  { key: "stores", label: "店舗数" },
  { key: "bedding", label: "寝具" },
  { key: "kitchen", label: "キッチン" },
  { key: "furniture", label: "家具" },
  { key: "appliance", label: "家電" },
  { key: "starter", label: "初期生活" },
];

export const furnitureRecommendations: PartnerRecommendation[] = [
  { title: "とにかく安く揃えたい人向け", description: "中古や低価格ショップを中心に確認します。", filterKey: "budget" },
  { title: "新品で揃えたい人向け", description: "寝具やキッチン用品を新品で揃えたい人向けです。", filterKey: "new" },
  { title: "中古で安く探したい人向け", description: "Trade MeやMarketplace系で探す方向けです。", filterKey: "used" },
  { title: "到着直後に必要なもの向け", description: "寝具、タオル、調理用品などをすぐ揃えたい人向けです。", filterKey: "arrival" },
];

export const furnitureServices: PartnerService[] = [
  { id: "kmart", category: "furniture", name: "Kmart", countryCode: "NZ", serviceType: "生活用品店", shortDescription: "寝具、キッチン用品、生活雑貨を低価格で揃えやすい店舗です。", priceNote: "低価格帯が中心。商品や在庫で変わります。", keyFeatures: ["低価格", "生活用品", "店舗"], recommendedFor: ["到着直後", "新品", "安さ重視"], cautions: ["大型家具や在庫状況は店舗ごとに確認してください。"], comparison: { priceRange: "低〜中", condition: "新品", delivery: "要確認", stores: "多い", bedding: true, kitchen: true, furniture: true, appliance: "一部", starter: true }, officialUrl: "https://www.kmart.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["budget", "new", "arrival"] },
  { id: "the-warehouse", category: "furniture", name: "The Warehouse", countryCode: "NZ", serviceType: "総合小売", shortDescription: "生活用品から家具・家電まで幅広く確認できます。", priceNote: "低〜中価格帯。セールで変動します。", keyFeatures: ["店舗多め", "生活用品", "家具"], recommendedFor: ["新品", "到着直後", "長期滞在"], cautions: ["配送条件と在庫を確認してください。"], comparison: { priceRange: "低〜中", condition: "新品", delivery: true, stores: "多い", bedding: true, kitchen: true, furniture: true, appliance: true, starter: true }, officialUrl: "https://www.thewarehouse.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["new", "delivery", "arrival"] },
  { id: "briscoes", category: "furniture", name: "Briscoes", countryCode: "NZ", serviceType: "家庭用品店", shortDescription: "寝具、キッチン、ホーム用品をセール時に確認しやすい店舗です。", priceNote: "セールにより大きく変わります。", keyFeatures: ["寝具", "キッチン", "セール"], recommendedFor: ["新品", "寝具重視"], cautions: ["定価とセール価格の差を確認してください。"], comparison: { priceRange: "中", condition: "新品", delivery: true, stores: "多い", bedding: true, kitchen: true, furniture: "一部", appliance: "一部", starter: true }, officialUrl: "https://www.briscoes.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["new", "delivery", "arrival"] },
  { id: "ikea", category: "furniture", name: "IKEA", countryCode: "NZ", serviceType: "家具店", shortDescription: "家具や収納を新品で揃えたい場合に確認できます。", priceNote: "商品と配送条件で変わります。", keyFeatures: ["家具", "収納", "新品"], recommendedFor: ["長期滞在", "新品家具"], cautions: ["NZでの配送・受け取り条件を確認してください。"], comparison: { priceRange: "中", condition: "新品", delivery: true, stores: "限定的", bedding: true, kitchen: true, furniture: true, appliance: "一部", starter: "要確認" }, officialUrl: "https://www.ikea.com/nz/en/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["new", "delivery"] },
  { id: "trade-me", category: "furniture", name: "Trade Me", countryCode: "NZ", serviceType: "中古マーケット", shortDescription: "中古家具や生活用品を探しやすいNZのマーケットプレイスです。", priceNote: "出品者と商品状態により大きく変わります。", keyFeatures: ["中古", "個人売買", "幅広い"], recommendedFor: ["中古", "安さ重視", "長期滞在"], cautions: ["受け取り方法、状態、詐欺リスクに注意してください。"], comparison: { priceRange: "低〜高", condition: "中古中心", delivery: "出品者次第", stores: "オンライン", bedding: true, kitchen: true, furniture: true, appliance: true, starter: true }, officialUrl: "https://www.trademe.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["budget", "used"] },
  { id: "facebook-marketplace", category: "furniture", name: "Facebook Marketplace", countryCode: "GLOBAL", serviceType: "中古マーケット", shortDescription: "近隣エリアで中古家具や生活用品を探せます。", priceNote: "出品者と交渉により変わります。", keyFeatures: ["中古", "近隣検索", "個人売買"], recommendedFor: ["中古", "安さ重視"], cautions: ["取引場所、安全性、支払い方法に注意してください。"], comparison: { priceRange: "低〜高", condition: "中古中心", delivery: "出品者次第", stores: "オンライン", bedding: "要確認", kitchen: true, furniture: true, appliance: true, starter: true }, officialUrl: "https://www.facebook.com/marketplace/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["budget", "used"] },
  { id: "second-hand-marketplaces", category: "furniture", name: "Marketplace系中古購入", countryCode: "NZ", serviceType: "中古購入", shortDescription: "地域掲示板や中古マーケットを使い、必要なものを安く揃える方法です。", priceNote: "出品者、地域、状態により変わります。", keyFeatures: ["中古", "地域", "低価格"], recommendedFor: ["安さ重視", "中古"], cautions: ["公式サービスではなく個人取引が多いため、安全確認が必要です。"], comparison: { priceRange: "低〜中", condition: "中古", delivery: "要確認", stores: "地域次第", bedding: "要確認", kitchen: true, furniture: true, appliance: true, starter: true }, officialUrl: "https://www.google.com/search?q=second+hand+furniture+new+zealand", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["budget", "used"] },
];
