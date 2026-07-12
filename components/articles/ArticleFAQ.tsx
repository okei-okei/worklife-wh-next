export type ArticleFaqItem = {
  question: string;
  answer: string;
};

export default function ArticleFAQ({ items }: { items: ArticleFaqItem[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
      <h2 className="text-lg font-bold text-gray-900">FAQ</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-xl border border-gray-200 bg-gray-50 p-3"
          >
            <summary className="cursor-pointer text-sm font-bold text-gray-900">
              {item.question}
            </summary>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
