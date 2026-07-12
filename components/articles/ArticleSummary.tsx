export default function ArticleSummary({
  learnings,
  conclusions,
}: {
  learnings: string[];
  conclusions: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-3 md:p-4">
        <h2 className="text-lg font-bold text-gray-900">この記事で分かること</h2>
        <ul className="mt-3 space-y-2">
          {learnings.slice(0, 6).map((item) => (
            <li key={item} className="flex gap-2 text-sm font-medium leading-6 text-gray-800">
              <span className="font-bold text-blue-700">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 md:p-4">
        <h2 className="text-lg font-bold text-gray-900">結論</h2>
        <ul className="mt-3 space-y-2">
          {conclusions.slice(0, 5).map((item) => (
            <li key={item} className="text-sm font-medium leading-6 text-gray-800">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
