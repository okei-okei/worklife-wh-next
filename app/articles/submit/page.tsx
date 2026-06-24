import Link from "next/link";

export default function ArticleSubmitPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-bold text-blue-700">WorkLife WH コラム</p>
          <h1 className="mt-1 text-2xl font-bold md:text-4xl">
            情報提供について
          </h1>
          <p className="mt-3 max-w-2xl font-medium leading-7 text-gray-700">
            現時点では、ユーザー自由投稿は受け付けていません。記事は運営側で内容を確認し、必要に応じて公開します。
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold">現在の運用方針</h2>
          <p className="mt-3 font-medium leading-7 text-gray-700">
            ワーホリ、仕事、住まい、ビザ、生活費に関する情報は、誤情報や個人情報の混入による影響が大きいため、まずは運営管理型の記事として公開します。
          </p>
          <p className="mt-3 font-medium leading-7 text-gray-700">
            将来的には、情報提供フォームや体験談募集フォームを用意し、管理者確認後に記事へ反映できる仕組みを検討します。
          </p>
        </section>

        <div className="flex justify-end">
          <Link
            href="/articles"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            役立ち情報一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
