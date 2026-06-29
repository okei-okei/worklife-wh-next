import Link from "next/link";
import AdDisclosureNotice from "@/components/AdDisclosureNotice";
import AuthAwareCta from "@/components/AuthAwareCta";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { createBreadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリ向け比較・おすすめサービス | WorkLife WH",
  description:
    "SIM/eSIM、海外保険、銀行口座、海外送金、電気、インターネット、家具、語学学校などをカテゴリ別に比較できます。",
  path: "/partners",
});

type PartnerCategoryCard = {
  title: string;
  icon: string;
  description: string;
  href: string;
  buttonLabel: string;
  services: string[];
  comparisonItems: string[];
};

const partnerCategoryCards: PartnerCategoryCard[] = [
  {
    title: "SIM/eSIM",
    icon: "📱",
    description:
      "渡航前に準備しやすいeSIMと、NZ現地で使いやすいSIMを比較できます。",
    href: "/partners/sim-esim",
    buttonLabel: "SIM/eSIMを比較する",
    services: ["Airalo", "Holafly", "Spark", "One NZ", "2degrees"],
    comparisonItems: [
      "データ容量",
      "通話/SMS",
      "出発前購入",
      "長期向き",
      "料金目安",
    ],
  },
  {
    title: "海外保険",
    icon: "🛡️",
    description: "ワーホリ・留学向け海外保険を比較",
    href: "/partners/insurance",
    buttonLabel: "海外保険を比較する",
    services: [
      "SafetyWing",
      "World Nomads",
      "Allianz",
      "Genki",
      "OrbitProtect",
    ],
    comparisonItems: [
      "医療補償",
      "携行品補償",
      "ワーホリ対応",
      "日本語対応",
      "保険料目安",
    ],
  },
  {
    title: "銀行口座",
    icon: "🏦",
    description:
      "給与受取、家賃支払い、生活費管理に使う銀行口座や多通貨サービスを比較できます。",
    href: "/partners/bank",
    buttonLabel: "銀行口座を比較する",
    services: ["ANZ", "ASB", "BNZ", "Westpac", "Kiwibank", "Wise"],
    comparisonItems: [
      "オンライン開設",
      "給与受取",
      "家賃支払い",
      "海外送金",
      "支店サポート",
    ],
  },
  {
    title: "海外送金",
    icon: "💸",
    description: "海外送金サービスを比較",
    href: "/partners/money-transfer",
    buttonLabel: "海外送金を比較する",
    services: ["Wise", "OFX", "Remitly", "Western Union", "XE"],
    comparisonItems: [
      "手数料",
      "為替レート",
      "着金速度",
      "日本語対応",
      "アプリ対応",
    ],
  },
  {
    title: "電気",
    icon: "⚡",
    description: "住居決定後に必要になる電気会社を比較できます。",
    href: "/partners/electricity",
    buttonLabel: "電気サービスを比較する",
    services: [
      "Contact Energy",
      "Mercury",
      "Genesis",
      "Electric Kiwi",
      "Flick",
    ],
    comparisonItems: [
      "基本料金",
      "電力量料金",
      "契約期間",
      "アプリ管理",
      "引っ越し手続き",
    ],
  },
  {
    title: "インターネット",
    icon: "🌐",
    description: "住居決定後に必要になるインターネット契約を比較できます。",
    href: "/partners/internet",
    buttonLabel: "インターネットを比較する",
    services: ["Spark", "One NZ", "2degrees", "Skinny", "Slingshot"],
    comparisonItems: [
      "光回線",
      "ワイヤレス",
      "データ無制限",
      "契約期間",
      "セット割",
    ],
  },
  {
    title: "家具・生活用品",
    icon: "🛒",
    description:
      "到着直後に必要な寝具、キッチン用品、家具、家電の購入先を比較できます。",
    href: "/partners/furniture",
    buttonLabel: "家具・生活用品を比較する",
    services: [
      "Kmart",
      "The Warehouse",
      "Briscoes",
      "Trade Me",
      "Facebook Marketplace",
    ],
    comparisonItems: [
      "新品",
      "中古",
      "配送",
      "価格帯",
      "到着直後向き",
    ],
  },
  {
    title: "語学学校",
    icon: "🎓",
    description:
      "英語学習、IELTS対策、仕事探し準備に使える語学学校を比較できます。",
    href: "/partners/language-school",
    buttonLabel: "語学学校を比較する",
    services: ["Languages International", "NZLC", "Kaplan", "EC English", "LSI"],
    comparisonItems: [
      "学費目安",
      "コース",
      "日本語サポート",
      "仕事サポート",
      "都市",
    ],
  },
  {
    title: "留学エージェント",
    icon: "🎒",
    description: "無料相談、語学学校紹介、ワーホリサポートを比較できます。",
    href: "/partners/study-agency",
    buttonLabel: "留学エージェントを比較する",
    services: [
      "School With",
      "スマ留",
      "EF",
      "留学ジャーナル",
      "ラストリゾート",
    ],
    comparisonItems: [
      "無料相談",
      "語学学校紹介",
      "ワーホリ対応",
      "現地サポート",
      "手数料",
    ],
  },
  {
    title: "航空券・移動",
    icon: "✈️",
    description:
      "日本からNZへの航空券や、NZ国内移動手段を比較できます。",
    href: "/partners/flights-transport",
    buttonLabel: "航空券・移動を比較する",
    services: [
      "Air New Zealand",
      "Qantas",
      "Jetstar",
      "Skyscanner",
      "Booking.com",
      "InterCity",
    ],
    comparisonItems: [
      "価格",
      "荷物",
      "変更可否",
      "国内移動",
      "市内移動",
    ],
  },
];

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <JsonLd
        data={createBreadcrumbJsonLd([
          { label: "ホーム", href: "/" },
          { label: "比較・おすすめ", href: "/partners" },
        ])}
      />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "ホーム", href: "/" },
                { label: "比較・おすすめ" },
              ]}
            />
          </div>
          <p className="mb-2 text-sm font-bold text-blue-700">
            WorkLife WH 比較・おすすめ
          </p>
          <h1 className="text-2xl font-bold md:text-4xl">
            生活準備サービスをカテゴリ別に比較
          </h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
            SIM、保険、銀行、送金、生活インフラなどをカテゴリ別に整理しています。気になるカテゴリを選ぶと、サービスカードと比較表で条件を確認できます。
          </p>
        </section>

        <AdDisclosureNotice />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {partnerCategoryCards.map((category) => (
            <article
              key={category.href}
              className="flex min-h-full flex-col rounded-2xl bg-white p-4 shadow md:p-5"
            >
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-xl"
                    >
                      {category.icon}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
                    {category.description}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-gray-900">
                    代表サービス
                  </p>
                  <TagList items={category.services} />
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-gray-900">
                    比較できる項目
                  </p>
                  <TagList items={category.comparisonItems} />
                </div>
              </div>

              <Link
                href={category.href}
                className="mt-5 block w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
              >
                {category.buttonLabel}
              </Link>
            </article>
          ))}
        </section>

        <AdDisclosureNotice detail />

        <AuthAwareCta
          title="比較したサービスを生活準備につなげる"
          description="気になる求人・物件を保存し、チェックリストや生活プランナーとあわせて準備を進められます。"
        />

        <div className="flex justify-end">
          <Link
            href="/mypage"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            マイページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
