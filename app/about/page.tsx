import Link from "next/link";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { createBreadcrumbJsonLd, createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = createPageMetadata({
  title: "WorkLife WHについて｜ニュージーランドワーホリ情報｜WorkLife WH",
  description:
    "WorkLife WH編集部の情報作成方針、更新ポリシー、広告掲載方針、プライバシーへの考え方を掲載しています。",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 md:px-6 md:py-10">
      <JsonLd
        data={createBreadcrumbJsonLd([
          { label: "ホーム", href: "/" },
          { label: "WorkLife WHについて", href: "/about" },
        ])}
      />
      <div className="mx-auto max-w-4xl space-y-4">
        <Breadcrumbs
          items={[{ label: "ホーム", href: "/" }, { label: "WorkLife WHについて" }]}
        />

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm font-bold text-blue-700">WorkLife WH 編集部</p>
          <h1 className="mt-2 text-2xl font-bold md:text-4xl">
            WorkLife WHについて
          </h1>
          <p className="mt-3 text-sm font-bold text-gray-700">
            海外生活を、もっとリアルに。
          </p>
          <p className="mt-4 text-sm font-medium leading-7 text-gray-700 md:text-base">
            WorkLife WHは、ニュージーランドでワーキングホリデーや海外生活を始める人が、仕事、住まい、お金、通信、生活準備を現実的に整理できるように作成している情報サービスです。
          </p>
        </section>

        {[
          {
            title: "サイトの目的",
            body: "検索で見つけた情報を読むだけで終わらせず、比較ページ、チェックリスト、ライフプランナーへつなげることで、ユーザーが次の行動を決めやすい状態を目指しています。",
          },
          {
            title: "情報の作成方針",
            body: "記事はWorkLife WH編集部が、ニュージーランドでのワーキングホリデー経験、公式情報、各サービスの公開情報をもとに作成しています。個人の体験だけで断定せず、契約や申込前には公式サイトの確認を促す方針です。",
          },
          {
            title: "更新ポリシー",
            body: "料金、サービス内容、ビザ、生活費などは変わる可能性があります。重要な記事や比較ページは定期的に見直し、必要に応じて更新します。",
          },
          {
            title: "広告掲載方針",
            body: "一部ページには広告・紹介リンクを含む場合があります。掲載サービスは、ワーホリ・海外生活の準備に役立つか、比較しやすいか、契約前に確認すべき情報が明確かを基準に整理しています。",
          },
        ].map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
          >
            <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
            <p className="mt-2 text-sm font-medium leading-7 text-gray-700">
              {section.body}
            </p>
          </section>
        ))}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-lg font-bold text-gray-900">お問い合わせ・法務情報</h2>
          <p className="mt-2 text-sm font-medium leading-7 text-gray-700">
            お問い合わせは {siteConfig.supportEmail} までお願いします。個人情報の取り扱い、広告・紹介リンク、利用規約については各法務ページをご確認ください。
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link
              href="/legal/privacy"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/legal/affiliate-disclosure"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
            >
              広告開示
            </Link>
            <Link
              href="/legal"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
            >
              法務一覧
            </Link>
          </div>
        </section>

        <div className="flex justify-end">
          <Link
            href="/articles"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            役立ち情報へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
