export type PartnerSeoCategory = {
  path: string;
  title: string;
  pageTitle: string;
  description: string;
  articleSlugs: string[];
};

export const partnerSeoCategories: PartnerSeoCategory[] = [
  {
    path: "/partners/sim-esim",
    title: "SIM/eSIM",
    pageTitle: "ニュージーランドワーホリ向けSIM/eSIM比較 | WorkLife WH",
    description:
      "ニュージーランド渡航前後に使えるSIM/eSIM、現地SIM、通信サービスを比較できます。",
    articleSlugs: ["nz-working-holiday-sim-esim-comparison"],
  },
  {
    path: "/partners/insurance",
    title: "海外保険",
    pageTitle: "ニュージーランドワーホリ向け海外保険比較 | WorkLife WH",
    description:
      "ニュージーランドのワーホリ・留学・旅行に備える海外保険を、補償内容やサポート条件で比較できます。",
    articleSlugs: ["nz-working-holiday-insurance-guide"],
  },
  {
    path: "/partners/money-transfer",
    title: "海外送金",
    pageTitle: "ニュージーランドワーホリ向け海外送金サービス比較 | WorkLife WH",
    description:
      "日本からニュージーランドへの送金方法を、手数料、為替レート、着金速度で比較できます。",
    articleSlugs: ["nz-working-holiday-money-transfer-guide"],
  },
  {
    path: "/partners/bank",
    title: "銀行口座",
    pageTitle: "ニュージーランドワーホリ向け銀行口座比較 | WorkLife WH",
    description:
      "NZ到着後の給与受取、家賃支払い、生活費管理に使う銀行口座を比較できます。",
    articleSlugs: ["nz-working-holiday-bank-account-guide"],
  },
  {
    path: "/partners/electricity",
    title: "電気",
    pageTitle: "ニュージーランド生活向け電気会社比較 | WorkLife WH",
    description:
      "ニュージーランドで住居が決まった後に必要な電気会社を、料金や契約条件で比較できます。",
    articleSlugs: ["nz-flat-electricity-provider-guide"],
  },
  {
    path: "/partners/internet",
    title: "インターネット",
    pageTitle: "ニュージーランド生活向けインターネット比較 | WorkLife WH",
    description:
      "フラット生活や長期滞在で使いやすいインターネット回線を、料金や契約条件で比較できます。",
    articleSlugs: ["nz-flat-internet-provider-guide"],
  },
  {
    path: "/partners/furniture",
    title: "家具・生活用品",
    pageTitle: "ニュージーランド生活向け家具・生活用品比較 | WorkLife WH",
    description:
      "到着直後や入居後に必要な家具、寝具、生活用品の購入先を比較できます。",
    articleSlugs: ["nz-arrival-furniture-daily-items-guide"],
  },
  {
    path: "/partners/language-school",
    title: "語学学校",
    pageTitle: "ニュージーランドワーホリ向け語学学校比較 | WorkLife WH",
    description:
      "英語学習、IELTS対策、仕事探し準備に使えるニュージーランドの語学学校を比較できます。",
    articleSlugs: ["nz-working-holiday-language-school-guide"],
  },
  {
    path: "/partners/study-agency",
    title: "留学エージェント",
    pageTitle: "ニュージーランドワーホリ向け留学エージェント比較 | WorkLife WH",
    description:
      "無料相談、語学学校紹介、ワーホリサポートを行う留学エージェントを比較できます。",
    articleSlugs: ["nz-working-holiday-study-agency-guide"],
  },
  {
    path: "/partners/flights-transport",
    title: "航空券・移動",
    pageTitle: "ニュージーランドワーホリ向け航空券・移動手段比較 | WorkLife WH",
    description:
      "日本からNZへの航空券、到着後の空港移動、NZ国内移動、市内交通を比較できます。",
    articleSlugs: ["nz-working-holiday-flights-transport-guide"],
  },
];

export function getPartnerSeoByPath(path: string) {
  return partnerSeoCategories.find((category) => category.path === path) || null;
}
