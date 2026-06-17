import Link from "next/link";
import { OPERATOR_EMAIL } from "../_data/legalDocuments";

export default function PrivacyRequestPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <p className="mb-2 text-sm font-bold text-blue-700">
            WorkLife WH
          </p>
          <h1 className="text-2xl font-bold md:text-4xl">
            プライバシー請求・通報
          </h1>
          <p className="mt-3 text-base font-medium leading-7 text-gray-800">
            情報開示、訂正、削除、利用停止、苦情、通報に関する導線です。ログイン済みの方はマイページから申請できます。
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">申請方法</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/mypage/privacy"
              className="rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
            >
              ログインして申請する
            </Link>
            <a
              href={`mailto:${OPERATOR_EMAIL}`}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50"
            >
              メールで問い合わせる
            </a>
          </div>
          <p className="mt-4 text-sm font-medium leading-6 text-gray-800">
            メールで連絡する場合は、登録メールアドレス、申請種別、対象データ、具体的な内容を記載してください。
          </p>
        </section>

        <div className="flex justify-end">
          <Link
            href="/legal"
            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            法務一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
