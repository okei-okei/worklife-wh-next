export const PARTNER_CATEGORIES = [
  {
    key: "sim",
    label: "SIM / eSIM",
    description: "到着直後から使える通信サービスを確認できます。",
  },
  {
    key: "insurance",
    label: "海外保険",
    description: "医療費や事故、盗難などに備える保険サービスを確認できます。",
  },
  {
    key: "bank",
    label: "銀行口座",
    description: "給与受け取りや生活費管理に使う銀行口座を確認できます。",
  },
  {
    key: "money_transfer",
    label: "送金",
    description: "日本とニュージーランドの間で使う海外送金サービスを確認できます。",
  },
  {
    key: "power",
    label: "電気",
    description: "入居後に必要な電気契約サービスを確認できます。",
  },
  {
    key: "internet",
    label: "インターネット",
    description: "住居で使う固定回線やホームインターネットを確認できます。",
  },
  {
    key: "furniture",
    label: "家具・生活用品",
    description: "寝具、机、調理用品など生活開始に必要な用品を確認できます。",
  },
  {
    key: "school",
    label: "語学学校",
    description: "英語学習や現地生活に慣れるための学校情報を確認できます。",
  },
  {
    key: "travel",
    label: "航空券・移動",
    description: "渡航や国内移動に必要なサービスを確認できます。",
  },
];

export function getPartnerCategoryLabel(category: string) {
  if (category === "remittance") return "送金";
  if (category === "english") return "語学学校";

  return (
    PARTNER_CATEGORIES.find((partnerCategory) => {
      return partnerCategory.key === category;
    })?.label ?? category
  );
}
