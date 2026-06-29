import Hero from "../components/Hero";
import Features from "../components/Features";
import Link from "next/link";
import AuthAwareCta from "@/components/AuthAwareCta";

export default function Home() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-gray-50 text-gray-900">
      <Hero />

      <section className="bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:p-6">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH Demo
            </p>
            <h2 className="text-2xl font-bold text-gray-900 md:text-4xl">
              海外の暮らしを設計する
            </h2>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
              仕事と住まいを選んで、月いくら残るか試せます。
            </p>
          </div>

          <div>
            <Link
              href="/demo-planner"
              className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-bold text-white sm:w-auto"
            >
              無料で生活プランを試す
            </Link>
          </div>
        </div>
      </section>

      <Features />

      <section className="bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-blue-700">準備を進める</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
              ワーホリ準備に必要なページへ
            </h2>
            <p className="mt-3 font-medium leading-7 text-gray-700">
              チェックリストで抜け漏れを確認し、比較ページや役立ち情報で条件を整理しながら、生活プランまでつなげられます。
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "チェックリスト",
                description: "渡航前、到着後、仕事・住まい探しの準備を確認します。",
                href: "/mypage/checklist",
              },
              {
                title: "比較・おすすめ",
                description: "SIM、保険、送金、銀行、生活インフラを比較できます。",
                href: "/partners",
              },
              {
                title: "役立ち情報",
                description: "NZワーホリ準備に必要な確認ポイントを記事で整理します。",
                href: "/articles",
              },
              {
                title: "公開求人",
                description: "公開中の求人を探し、気になる仕事を保存できます。",
                href: "/jobs",
              },
              {
                title: "公開物件",
                description: "住まい候補を探し、生活プランの検討につなげられます。",
                href: "/properties",
              },
              {
                title: "ライフプランナー",
                description: "仕事と住まいを組み合わせて収支を比較できます。",
                href: "/planner",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm hover:bg-blue-50"
              >
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
                  {item.description}
                </p>
                <span className="mt-auto pt-4 text-sm font-bold text-blue-700">
                  開く
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <AuthAwareCta
              title="準備した内容を保存して進める"
              description="チェックリスト、求人・物件、生活プランを保存すると、後からマイページでまとめて確認できます。"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
