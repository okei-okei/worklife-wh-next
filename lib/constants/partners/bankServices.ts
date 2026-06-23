import type { PartnerComparisonField, PartnerFilter, PartnerRecommendation, PartnerService } from "./types";

export const bankFilters: PartnerFilter[] = [
  { key: "nz_bank", label: "NZ銀行" },
  { key: "online", label: "オンライン対応" },
  { key: "salary", label: "給与受取向け" },
  { key: "remittance", label: "送金と相性が良い" },
  { key: "branch", label: "支店サポートあり" },
];

export const bankComparisonFields: PartnerComparisonField[] = [
  { key: "openEase", label: "開設しやすさ", important: true },
  { key: "onlineOpen", label: "オンライン開設", important: true },
  { key: "addressRequired", label: "現地住所" },
  { key: "debitCard", label: "デビットカード", important: true },
  { key: "app", label: "アプリ" },
  { key: "monthlyFee", label: "月額手数料" },
  { key: "atm", label: "ATM" },
  { key: "remittanceFit", label: "送金相性" },
  { key: "salary", label: "給与受取" },
  { key: "branchSupport", label: "支店" },
];

export const bankRecommendations: PartnerRecommendation[] = [
  { title: "NZ到着後すぐ使いたい人向け", description: "アプリやオンライン手続きも含めて準備しやすい選択肢です。", filterKey: "online" },
  { title: "給与受取用に使いたい人向け", description: "NZの雇用先からの給与受取に使いやすい銀行を比較します。", filterKey: "salary" },
  { title: "送金と合わせて使いたい人向け", description: "日本からNZへの送金や外貨管理と組み合わせやすい選択肢です。", filterKey: "remittance" },
  { title: "店舗サポートを重視する人向け", description: "対面で相談しやすい大手銀行を中心に確認します。", filterKey: "branch" },
];

export const bankServices: PartnerService[] = [
  { id: "anz-nz", category: "bank", name: "ANZ New Zealand", countryCode: "NZ", serviceType: "NZ銀行", shortDescription: "NZ大手銀行。給与受取や日常決済用の口座として検討できます。", priceNote: "口座種類や条件により手数料が変わります。", keyFeatures: ["大手銀行", "支店あり", "デビットカード"], recommendedFor: ["給与受取", "店舗サポート", "長期滞在"], cautions: ["本人確認、住所、IRDなど必要書類を確認してください。"], comparison: { openEase: "標準的", onlineOpen: "要確認", addressRequired: "必要な場合あり", debitCard: true, app: "あり", monthlyFee: "口座により異なる", atm: "多い", remittanceFit: "標準", salary: true, branchSupport: true }, officialUrl: "https://www.anz.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["nz_bank", "salary", "branch"] },
  { id: "asb", category: "bank", name: "ASB Bank", countryCode: "NZ", serviceType: "NZ銀行", shortDescription: "アプリやオンライン機能を確認しやすいNZ大手銀行です。", priceNote: "口座種類により手数料が変わります。", keyFeatures: ["大手銀行", "アプリ", "支店あり"], recommendedFor: ["アプリ重視", "給与受取", "店舗サポート"], cautions: ["開設条件はビザや住所状況で変わる場合があります。"], comparison: { openEase: "標準的", onlineOpen: "要確認", addressRequired: "必要な場合あり", debitCard: true, app: "使いやすい", monthlyFee: "口座により異なる", atm: "多い", remittanceFit: "標準", salary: true, branchSupport: true }, officialUrl: "https://www.asb.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["nz_bank", "online", "salary", "branch"] },
  { id: "bnz", category: "bank", name: "BNZ", countryCode: "NZ", serviceType: "NZ銀行", shortDescription: "NZの主要銀行。日常口座やカード利用を比較できます。", priceNote: "口座タイプごとに確認が必要です。", keyFeatures: ["大手銀行", "支店あり", "カード"], recommendedFor: ["給与受取", "長期滞在"], cautions: ["オンライン開設可否と必要書類を公式サイトで確認してください。"], comparison: { openEase: "標準的", onlineOpen: "要確認", addressRequired: "必要な場合あり", debitCard: true, app: "あり", monthlyFee: "口座により異なる", atm: "多い", remittanceFit: "標準", salary: true, branchSupport: true }, officialUrl: "https://www.bnz.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["nz_bank", "salary", "branch"] },
  { id: "westpac-nz", category: "bank", name: "Westpac New Zealand", countryCode: "NZ", serviceType: "NZ銀行", shortDescription: "NZ大手銀行。支店サポートと日常決済を確認できます。", priceNote: "手数料は口座と条件により異なります。", keyFeatures: ["大手銀行", "支店あり", "給与受取"], recommendedFor: ["店舗サポート", "給与受取"], cautions: ["最新の開設条件と必要書類を確認してください。"], comparison: { openEase: "標準的", onlineOpen: "要確認", addressRequired: "必要な場合あり", debitCard: true, app: "あり", monthlyFee: "口座により異なる", atm: "多い", remittanceFit: "標準", salary: true, branchSupport: true }, officialUrl: "https://www.westpac.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["nz_bank", "salary", "branch"] },
  { id: "kiwibank", category: "bank", name: "Kiwibank", countryCode: "NZ", serviceType: "NZ銀行", shortDescription: "NZローカル銀行。日常利用口座として比較できます。", priceNote: "口座ごとの手数料を確認してください。", keyFeatures: ["NZ銀行", "日常口座", "カード"], recommendedFor: ["現地生活", "給与受取"], cautions: ["支店やサポートの利用条件を確認してください。"], comparison: { openEase: "標準的", onlineOpen: "要確認", addressRequired: "必要な場合あり", debitCard: true, app: "あり", monthlyFee: "口座により異なる", atm: "要確認", remittanceFit: "標準", salary: true, branchSupport: true }, officialUrl: "https://www.kiwibank.co.nz/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["nz_bank", "salary", "branch"] },
  { id: "wise-account", category: "bank", name: "Wise", countryCode: "GLOBAL", serviceType: "マルチカレンシー口座", shortDescription: "日本からNZへの送金や外貨管理と組み合わせやすいサービスです。", priceNote: "送金・両替手数料は通貨と金額で変わります。", keyFeatures: ["外貨管理", "送金", "アプリ"], recommendedFor: ["送金と併用", "到着前準備", "アプリ重視"], cautions: ["NZ銀行口座そのものではないため給与受取条件を確認してください。"], comparison: { openEase: "比較的簡単", onlineOpen: true, addressRequired: "国により異なる", debitCard: "要確認", app: "あり", monthlyFee: "要確認", atm: "カード条件による", remittanceFit: "良い", salary: "要確認", branchSupport: false }, officialUrl: "https://wise.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["online", "remittance"] },
  { id: "revolut", category: "bank", name: "Revolut", countryCode: "GLOBAL", serviceType: "デジタル金融サービス", shortDescription: "アプリで外貨管理やカード利用を確認できるサービスです。", priceNote: "プランや利用条件により変わります。", keyFeatures: ["アプリ", "外貨管理", "カード"], recommendedFor: ["アプリ重視", "旅行併用"], cautions: ["NZでの利用可否、本人確認、カード条件を確認してください。"], comparison: { openEase: "オンライン中心", onlineOpen: true, addressRequired: "国により異なる", debitCard: "要確認", app: "強い", monthlyFee: "プランによる", atm: "条件あり", remittanceFit: "要確認", salary: "要確認", branchSupport: false }, officialUrl: "https://www.revolut.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["online", "remittance"] },
];
