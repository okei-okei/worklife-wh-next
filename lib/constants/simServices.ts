export type SimService = {
  id: string;
  name: string;
  type: "eSIM" | "Physical SIM" | "Both";
  coverage: "NZ" | "Global" | "Regional";
  canBuyBeforeDeparture: boolean;
  hasUnlimitedData: boolean;
  hasCallSms: boolean;
  allowsTethering: boolean;
  appManagement: boolean;
  priceNote: string;
  dataNote: string;
  durationNote: string;
  recommendedFor: string[];
  cautions: string[];
  officialUrl: string;
  isAffiliate: boolean;
  affiliateUrl?: string;
  lastCheckedAt: string;
  audienceTags: Array<
    | "short_term"
    | "long_term"
    | "nz_local"
    | "pre_departure"
    | "esim"
    | "local_sim"
  >;
};

export const simServices: SimService[] = [
  {
    id: "airalo",
    name: "Airalo",
    type: "eSIM",
    coverage: "Global",
    canBuyBeforeDeparture: true,
    hasUnlimitedData: false,
    hasCallSms: false,
    allowsTethering: true,
    appManagement: true,
    priceNote: "短期データプランを中心に、容量・日数別の目安料金があります。",
    dataNote: "小容量から中容量のデータプランが中心です。",
    durationNote: "短期から数十日程度のプランを確認できます。",
    recommendedFor: [
      "初めてのeSIM向け",
      "短期滞在向け",
      "アプリで管理しやすい",
    ],
    cautions: [
      "通話/SMSは基本的に対象外のプランが多いため、必要な場合は公式サイトで確認してください。",
      "スマホがeSIM対応か事前に確認してください。",
    ],
    officialUrl: "https://www.airalo.com/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["short_term", "pre_departure", "esim"],
  },
  {
    id: "holafly",
    name: "Holafly",
    type: "eSIM",
    coverage: "Global",
    canBuyBeforeDeparture: true,
    hasUnlimitedData: true,
    hasCallSms: false,
    allowsTethering: true,
    appManagement: true,
    priceNote: "データ多め・無制限系プランの目安料金を公式サイトで確認できます。",
    dataNote: "無制限または大容量系のプランが中心です。",
    durationNote: "旅行日数に合わせた期間を選べる場合があります。",
    recommendedFor: ["データ多め向け", "旅行者向け", "簡単設定"],
    cautions: [
      "無制限表記でも公平利用や速度制限の条件がある場合があります。",
      "テザリング条件はプランごとに変わる可能性があります。",
    ],
    officialUrl: "https://esim.holafly.com/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["short_term", "pre_departure", "esim"],
  },
  {
    id: "nomad",
    name: "Nomad",
    type: "eSIM",
    coverage: "Global",
    canBuyBeforeDeparture: true,
    hasUnlimitedData: false,
    hasCallSms: false,
    allowsTethering: true,
    appManagement: true,
    priceNote: "国別・地域別プランを比較しながら目安料金を確認できます。",
    dataNote: "容量別のデータプランが中心です。",
    durationNote: "短期から中期の滞在向けプランを確認できます。",
    recommendedFor: ["価格比較したい人向け", "複数国移動向け"],
    cautions: [
      "対応ネットワークや速度は渡航先・プランにより異なります。",
      "通話/SMSが必要な場合は別手段の準備も検討してください。",
    ],
    officialUrl: "https://www.getnomad.app/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["short_term", "pre_departure", "esim"],
  },
  {
    id: "ubigi",
    name: "Ubigi",
    type: "eSIM",
    coverage: "Global",
    canBuyBeforeDeparture: true,
    hasUnlimitedData: false,
    hasCallSms: false,
    allowsTethering: true,
    appManagement: true,
    priceNote: "国・地域・容量別の目安料金を公式サイトで確認できます。",
    dataNote: "データ通信向けのeSIMプランが中心です。",
    durationNote: "短期から中期利用向けの期間設定があります。",
    recommendedFor: ["安定性重視", "グローバル利用向け"],
    cautions: [
      "利用端末と渡航先ネットワークの対応状況を確認してください。",
      "音声通話やSMSは別途確認が必要です。",
    ],
    officialUrl: "https://www.ubigi.com/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["short_term", "pre_departure", "esim"],
  },
  {
    id: "mobimatter",
    name: "MobiMatter",
    type: "eSIM",
    coverage: "Global",
    canBuyBeforeDeparture: true,
    hasUnlimitedData: false,
    hasCallSms: false,
    allowsTethering: true,
    appManagement: true,
    priceNote: "複数プロバイダーのプランを比較し、目安料金を確認できます。",
    dataNote: "容量・地域ごとに幅広いデータプランがあります。",
    durationNote: "短期から中期向けのプランを比較できます。",
    recommendedFor: ["プラン比較重視", "安く探したい人向け"],
    cautions: [
      "提供元により条件が異なるため、購入前に詳細条件を確認してください。",
      "サポート窓口や返金条件も確認しておくと安心です。",
    ],
    officialUrl: "https://mobimatter.com/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["short_term", "pre_departure", "esim"],
  },
  {
    id: "spark",
    name: "Spark New Zealand",
    type: "Both",
    coverage: "NZ",
    canBuyBeforeDeparture: false,
    hasUnlimitedData: true,
    hasCallSms: true,
    allowsTethering: true,
    appManagement: true,
    priceNote: "プリペイド・月額系プランの目安料金を公式サイトで確認できます。",
    dataNote: "小容量から大容量・無制限系まで選択肢があります。",
    durationNote: "短期滞在から長期生活まで検討しやすいプランがあります。",
    recommendedFor: ["NZ現地大手", "長期滞在向け", "店舗サポートあり"],
    cautions: [
      "本人確認や現地での受け取り条件が必要な場合があります。",
      "キャンペーンやプラン内容は頻繁に変わる可能性があります。",
    ],
    officialUrl: "https://www.spark.co.nz/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["long_term", "nz_local", "local_sim"],
  },
  {
    id: "one-nz",
    name: "One New Zealand",
    type: "Both",
    coverage: "NZ",
    canBuyBeforeDeparture: false,
    hasUnlimitedData: true,
    hasCallSms: true,
    allowsTethering: true,
    appManagement: true,
    priceNote: "プリペイド・月額系プランの目安料金を公式サイトで確認できます。",
    dataNote: "通話/SMS込みやデータ多めのプランを確認できます。",
    durationNote: "中長期の現地生活向けプランを検討できます。",
    recommendedFor: ["NZ現地大手", "通話/SMS重視", "現地生活向け"],
    cautions: [
      "店舗・オンライン手続きの条件を確認してください。",
      "通話/SMSやローミング条件はプランごとに異なります。",
    ],
    officialUrl: "https://one.nz/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["long_term", "nz_local", "local_sim"],
  },
  {
    id: "2degrees",
    name: "2degrees",
    type: "Physical SIM",
    coverage: "NZ",
    canBuyBeforeDeparture: false,
    hasUnlimitedData: true,
    hasCallSms: true,
    allowsTethering: true,
    appManagement: true,
    priceNote: "プリペイドや月額系の目安料金を公式サイトで確認できます。",
    dataNote: "日常利用向けからデータ多めまで選択肢があります。",
    durationNote: "現地生活の中期・長期利用向けに検討できます。",
    recommendedFor: ["NZ現地向け", "コスパ重視"],
    cautions: [
      "対応エリアや通信品質は滞在地域により差があります。",
      "最新のキャンペーン条件を公式サイトで確認してください。",
    ],
    officialUrl: "https://www.2degrees.nz/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["long_term", "nz_local", "local_sim"],
  },
  {
    id: "skinny",
    name: "Skinny",
    type: "Physical SIM",
    coverage: "NZ",
    canBuyBeforeDeparture: false,
    hasUnlimitedData: false,
    hasCallSms: true,
    allowsTethering: true,
    appManagement: true,
    priceNote: "低価格帯のプリペイドプランを公式サイトで確認できます。",
    dataNote: "シンプルな容量別プランが中心です。",
    durationNote: "短期から日常利用まで使いやすい期間設定があります。",
    recommendedFor: ["低価格重視", "シンプルプラン"],
    cautions: [
      "サポート体制や店舗対応の有無を確認してください。",
      "長期滞在ではデータ容量と通話条件を比較してください。",
    ],
    officialUrl: "https://www.skinny.co.nz/",
    isAffiliate: false,
    lastCheckedAt: "2026-06-23",
    audienceTags: ["short_term", "long_term", "nz_local", "local_sim"],
  },
];
