export default function ArticleExperience({
  category,
}: {
  category: string;
}) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 md:p-4">
      <h2 className="text-lg font-bold text-gray-900">実際に感じたこと</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
        ニュージーランドで生活してみると、{category}
        は事前に調べていても現地で判断が必要になる場面があります。料金や条件だけで決めるより、通いやすさ、問い合わせやすさ、生活リズムに合うかを一緒に見ると失敗しにくいです。
      </p>
    </section>
  );
}
