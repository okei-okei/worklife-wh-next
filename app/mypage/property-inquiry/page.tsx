import Link from "next/link";

const propertyLinks = [
  {
    href: "/mypage/applications?target_type=property&target_source=saved&document_type=property_inquiry",
    title: "保存済み物件から問い合わせメールを作る",
    description: "マイページに保存した物件を選んで、問い合わせメールを作成します。",
  },
  {
    href: "/mypage/applications?target_type=property&target_source=public&document_type=property_inquiry",
    title: "公開物件から作る",
    description: "WorkLife WH内の公開物件を選んで問い合わせメールを作成します。",
  },
  {
    href: "/mypage/applications?target_type=property&target_source=manual&document_type=property_inquiry",
    title: "外部物件URL・手入力から作る",
    description: "Trade Meなど外部サイトの物件名やURLを入力して作成します。",
  },
];

export default function PropertyInquiryPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section>
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="text-2xl font-bold md:text-4xl">
            物件問い合わせ支援
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
            保存済み物件や外部物件URLをもとに、問い合わせメールを作成できます。
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {propertyLinks.map((item) => (
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
