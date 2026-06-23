import Link from "next/link";
import ReturnBalanceSimulator from "@/components/simulator/ReturnBalanceSimulator";

export default function SimulatorPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 max-w-3xl"><p className="text-sm font-bold text-emerald-700">WorkLife WH</p><h1 className="mt-1 text-2xl font-bold md:text-4xl">生活シミュレーション</h1><p className="mt-2 font-medium leading-7 text-gray-700">滞在期間と週ごとの収支から、帰国時点で残る金額を確認できます。</p></header>
        <ReturnBalanceSimulator />
        <div className="flex justify-end"><Link href="/mypage" className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto">マイページへ戻る</Link></div>
      </div>
    </main>
  );
}
