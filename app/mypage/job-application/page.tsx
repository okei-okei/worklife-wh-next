import Link from "next/link";

const jobLinks = [
  {
    href: "/mypage/applications?target_type=job&target_source=saved&document_type=application_email",
    title: "保存済み求人から応募メールを作る",
    description: "マイページに保存した求人を選んで、英語の応募メールを作成します。",
  },
  {
    href: "/mypage/applications?target_type=job&target_source=saved&document_type=cover_letter",
    title: "保存済み求人からカバーレターを作る",
    description: "履歴書情報をもとに、求人向けのカバーレターを作成します。",
  },
  {
    href: "/mypage/applications?target_type=job&target_source=public&document_type=application_email",
    title: "公開求人から作る",
    description: "WorkLife WH内の公開求人を選んで応募文を作成します。",
  },
  {
    href: "/mypage/applications?target_type=job&target_source=manual&document_type=application_email",
    title: "外部求人URL・手入力から作る",
    description: "SEEKなど外部サイトの求人名やURLを入力して作成します。",
  },
];

export default function JobApplicationPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section>
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="text-2xl font-bold md:text-4xl">求人応募支援</h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
            保存済み求人や外部求人URLをもとに、応募メールとカバーレターを作成できます。
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {jobLinks.map((item) => (
            <Link key={item.href} href={item.href} className="block min-w-0">
              <div className="min-h-full rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {item.title}
                </h2>
                <p className="mt-2 text-base font-medium leading-7 text-gray-800">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </section>

        <div className="flex justify-end">
          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            ← マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
