import Link from "next/link";

export default function ArticleEditorInfo() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
      <h2 className="text-lg font-bold text-gray-900">運営</h2>
      <p className="mt-2 text-sm font-bold text-gray-900">WorkLife WH 編集部</p>
      <ul className="mt-3 grid grid-cols-1 gap-2 text-sm font-medium leading-6 text-gray-700 md:grid-cols-2">
        <li>・ニュージーランドでのワーキングホリデー経験をもとに執筆</li>
        <li>・実体験と公式情報を組み合わせて記事を作成</li>
        <li>・仕事探し、家探し、生活情報を継続的に更新</li>
        <li>・SIM、銀行、海外送金、海外保険、ライフプランナーも整理</li>
      </ul>
      <Link
        href="/about"
        className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-800"
      >
        運営者情報を見る
      </Link>
    </section>
  );
}
