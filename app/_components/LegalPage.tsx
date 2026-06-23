import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  lead: string;
  sections: LegalSection[];
};

export function LegalPage({ title, lead, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH
            </p>
            <h1 className="text-4xl font-bold">{title}</h1>
            <p className="mt-3 leading-7 text-gray-600">{lead}</p>
          </div>

          <Link
            href="/"
            className="rounded-lg bg-gray-500 px-4 py-2 text-white"
          >
            ← TOPへ戻る
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-2xl font-bold">{section.title}</h2>

                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="leading-8 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
