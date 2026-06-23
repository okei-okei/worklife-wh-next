import type { PartnerComparisonField, PartnerFilter, PartnerRecommendation, PartnerService } from "./types";

export const moneyTransferFilters: PartnerFilter[] = [
  { key: "low_fee", label: "手数料重視" },
  { key: "fast", label: "早さ重視" },
  { key: "large", label: "高額送金向け" },
  { key: "small", label: "少額送金向け" },
  { key: "app", label: "アプリ対応" },
];

export const moneyTransferComparisonFields: PartnerComparisonField[] = [
  { key: "fee", label: "手数料", important: true },
  { key: "rate", label: "為替レート", important: true },
  { key: "speed", label: "着金速度", important: true },
  { key: "minAmount", label: "最低送金額" },
  { key: "largeTransfer", label: "高額送金" },
  { key: "smallTransfer", label: "少額送金" },
  { key: "jpToNz", label: "日本→NZ" },
  { key: "app", label: "アプリ" },
  { key: "bankDeposit", label: "銀行口座" },
  { key: "cashPickup", label: "現金受取" },
];

export const moneyTransferRecommendations: PartnerRecommendation[] = [
  { title: "手数料を抑えたい人向け", description: "為替レートと手数料をまとめて確認したい人向けです。", filterKey: "low_fee" },
  { title: "早く送金したい人向け", description: "着金スピードを優先して確認したい人向けです。", filterKey: "fast" },
  { title: "高額送金向け", description: "初期費用や家賃準備など大きめの送金を検討する人向けです。", filterKey: "large" },
  { title: "初めて海外送金する人向け", description: "アプリで手続きしやすいサービスを中心に確認します。", filterKey: "app" },
];

export const moneyTransferServices: PartnerService[] = [
  { id: "wise-transfer", category: "money_transfer", name: "Wise", countryCode: "GLOBAL", serviceType: "海外送金", shortDescription: "為替レートと手数料を確認しながら送金しやすいサービスです。", priceNote: "送金額、通貨、支払方法で変わります。", keyFeatures: ["透明な手数料", "アプリ", "銀行送金"], recommendedFor: ["手数料重視", "初めての送金", "少額送金"], cautions: ["本人確認や送金上限を確認してください。"], comparison: { fee: "比較しやすい", rate: "実勢レート系", speed: "数分〜数日目安", minAmount: "要確認", largeTransfer: true, smallTransfer: true, jpToNz: true, app: true, bankDeposit: true, cashPickup: false }, officialUrl: "https://wise.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["low_fee", "fast", "large", "small", "app"] },
  { id: "remitly", category: "money_transfer", name: "Remitly", countryCode: "GLOBAL", serviceType: "海外送金", shortDescription: "スピード重視や銀行口座向け送金を確認できます。", priceNote: "送金先、速度、支払方法により異なります。", keyFeatures: ["スピード選択", "アプリ", "海外送金"], recommendedFor: ["早さ重視", "少額送金"], cautions: ["為替レートと手数料を合計で確認してください。"], comparison: { fee: "条件による", rate: "要確認", speed: "速い選択肢あり", minAmount: "要確認", largeTransfer: "要確認", smallTransfer: true, jpToNz: "要確認", app: true, bankDeposit: true, cashPickup: "地域による" }, officialUrl: "https://www.remitly.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["fast", "small", "app"] },
  { id: "ofx", category: "money_transfer", name: "OFX", countryCode: "GLOBAL", serviceType: "海外送金", shortDescription: "高額送金や為替相談を検討したい人向けの送金サービスです。", priceNote: "送金額や通貨で変わります。", keyFeatures: ["高額送金", "為替", "法人/個人"], recommendedFor: ["高額送金", "レート重視"], cautions: ["最低送金額や口座開設条件を確認してください。"], comparison: { fee: "要確認", rate: "比較向き", speed: "数日目安", minAmount: "要確認", largeTransfer: true, smallTransfer: false, jpToNz: true, app: true, bankDeposit: true, cashPickup: false }, officialUrl: "https://www.ofx.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["large", "app"] },
  { id: "western-union", category: "money_transfer", name: "Western Union", countryCode: "GLOBAL", serviceType: "海外送金", shortDescription: "現金受取を含む幅広い送金方法を確認できます。", priceNote: "送金方法、国、金額により変わります。", keyFeatures: ["現金受取", "店舗網", "オンライン"], recommendedFor: ["現金受取", "早さ重視"], cautions: ["手数料と為替レートを必ず確認してください。"], comparison: { fee: "条件による", rate: "要確認", speed: "速い選択肢あり", minAmount: "要確認", largeTransfer: "要確認", smallTransfer: true, jpToNz: "要確認", app: true, bankDeposit: true, cashPickup: true }, officialUrl: "https://www.westernunion.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["fast", "small", "app"] },
  { id: "xe", category: "money_transfer", name: "Xe", countryCode: "GLOBAL", serviceType: "海外送金", shortDescription: "為替レート確認と海外送金をまとめて検討できます。", priceNote: "送金額と通貨ペアで変わります。", keyFeatures: ["為替", "送金", "アプリ"], recommendedFor: ["レート確認", "高額送金"], cautions: ["着金日数や手数料体系を確認してください。"], comparison: { fee: "要確認", rate: "比較向き", speed: "数分〜数日目安", minAmount: "要確認", largeTransfer: true, smallTransfer: true, jpToNz: true, app: true, bankDeposit: true, cashPickup: false }, officialUrl: "https://www.xe.com/", isAffiliate: false, lastCheckedAt: "2026-06-23", filterTags: ["large", "small", "app"] },
];
