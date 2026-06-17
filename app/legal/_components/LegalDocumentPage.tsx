import Link from "next/link";
import type { LegalDocument } from "../_data/legalDocuments";

type LegalDocumentPageProps = {
  document: LegalDocument;
};

const relatedLinks = [
  { href: "/legal/terms", label: "利用規約" },
  { href: "/legal/privacy", label: "プライバシー" },
  { href: "/legal/ai-policy", label: "AI利用" },
  { href: "/legal/cookies", label: "Cookie" },
  { href: "/legal/affiliate-disclosure", label: "広告開示" },
  { href: "/legal/data-transfer", label: "データ移転" },
];

export default function LegalDocumentPage({
  document,
}: LegalDocumentPageProps) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 法務ページ
            </p>
            <h1 className="break-words text-2xl font-bold md:text-4xl">
              {document.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
              {document.description}
            </p>
            <p className="mt-3 text-sm font-bold text-gray-700">
              Version {document.version} / 最終更新日 {document.lastUpdated}
            </p>
          </div>

          <Link
            href="/legal"
            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            法務一覧へ
          </Link>
        </div>

        <article className="rounded-2xl bg-white p-4 shadow md:p-6">
          <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium leading-7 text-blue-900">
            このページは初期版のドラフトです。契約や重要な判断を行う場合は、
            公式情報、専門家、関係機関の情報も確認してください。
          </p>

          <div className="mt-8 space-y-8">
            {document.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base font-medium leading-8 text-gray-800"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <nav className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-lg font-bold text-gray-900">関連ページ</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
