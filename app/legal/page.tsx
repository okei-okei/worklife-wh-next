import Link from "next/link";
import { legalDocuments, OPERATOR_EMAIL, OPERATOR_NAME } from "./_data/legalDocuments";

export default function LegalIndexPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <p className="mb-2 text-sm font-bold text-blue-700">
            WorkLife WH
          </p>
          <h1 className="text-2xl font-bold md:text-4xl">法務・ポリシー一覧</h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
            利用規約、プライバシー、AI利用、広告開示、Cookieなど、サービス利用に関わる文書をまとめています。
          </p>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-800">
            <p>運営者: {OPERATOR_NAME}</p>
            <p>
              管理メールアドレス:{" "}
              <a href={`mailto:${OPERATOR_EMAIL}`} className="font-bold text-blue-700 underline">
                {OPERATOR_EMAIL}
              </a>
            </p>
            <p>
              サービス内容や提携範囲の変更に応じて、法務文書は適宜更新します。
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {legalDocuments.map((document) => (
            <Link
              key={document.key}
              href={`/legal/${document.slug}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow transition hover:border-blue-200 hover:shadow-md md:p-5"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                v{document.version}
              </p>
              <h2 className="mt-2 text-lg font-bold text-gray-900">
                {document.title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
                {document.description}
              </p>
              <p className="mt-4 text-sm font-bold text-blue-700">確認する</p>
            </Link>
          ))}
        </section>

        <div className="flex justify-end">
          <Link
            href="/"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            TOPへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
