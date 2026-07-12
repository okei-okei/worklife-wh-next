function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ja-JP");
}

export default function ArticleUpdateHistory({
  updatedAt,
}: {
  updatedAt: string | null | undefined;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-3 md:p-4">
      <h2 className="text-lg font-bold text-gray-900">更新履歴</h2>
      <ul className="mt-3 space-y-2 text-sm font-medium leading-6 text-gray-700">
        <li>{formatDate(updatedAt)} 実体験、比較導線、FAQを確認しました。</li>
      </ul>
    </section>
  );
}
