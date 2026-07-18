import Link from "next/link";
import type { Metadata } from "next";
import PublicLifeSimulator from "@/components/simulator/PublicLifeSimulator";

export const metadata: Metadata = {
  title: "ニュージーランドワーホリ生活費シミュレーション｜WorkLife WH",
  description:
    "公開求人と物件を選び、収入・家賃・生活費からニュージーランドでの毎月の収支を無料で試算できます。登録不要・保存なしで利用できます。",
  alternates: {
    canonical: "/simulator",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SimulatorPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 max-w-3xl md:mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            WorkLife WH
          </p>
          <h1 className="mt-2 text-2xl font-black md:text-4xl">
            ニュージーランドワーホリ生活費シミュレーション
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700 md:text-base md:leading-7">
            公開求人と物件を一つずつ選び、収入・家賃・生活費から毎月の収支を試算できます。
          </p>
          <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700">
            登録不要・お試し計算・保存なし
          </p>
        </header>
        <PublicLifeSimulator />
        <div className="mt-6 flex justify-end">
          <Link
            href="/"
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            ホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
