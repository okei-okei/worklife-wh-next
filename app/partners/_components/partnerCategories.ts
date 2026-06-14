export const PARTNER_CATEGORIES = [
  {
    key: "insurance",
    label: "保険",
    description: "医療費や事故、盗難などに備える保険サービス",
  },
  {
    key: "sim",
    label: "SIM / eSIM",
    description: "到着直後から使える通信サービス",
  },
  {
    key: "bank",
    label: "銀行",
    description: "給与受け取りや生活費管理に使う銀行口座",
  },
  {
    key: "remittance",
    label: "送金",
    description: "日本と滞在国の間で使う海外送金サービス",
  },
  {
    key: "power",
    label: "電気",
    description: "入居後に必要な電気契約サービス",
  },
  {
    key: "internet",
    label: "インターネット",
    description: "住居で使う固定回線やホームインターネット",
  },
  {
    key: "furniture",
    label: "家具・生活用品",
    description: "寝具、机、調理用品など生活開始に必要な用品",
  },
  {
    key: "english",
    label: "英語学習",
    description: "仕事探しや生活に役立つ英語学習サービス",
  },
];

export function getPartnerCategoryLabel(category: string) {
  return (
    PARTNER_CATEGORIES.find((partnerCategory) => {
      return partnerCategory.key === category;
    })?.label ?? category
  );
}
