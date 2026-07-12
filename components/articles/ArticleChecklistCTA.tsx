import TrackedLink from "@/components/TrackedLink";

export default function ArticleChecklistCTA({
  href,
  articleSlug,
  category,
}: {
  href: string;
  articleSlug: string;
  category: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
      <h2 className="text-lg font-bold text-gray-900">チェックリストで準備する</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
        記事で確認した内容を、渡航前・到着後のチェックリストに落とし込めます。
      </p>
      <TrackedLink
        href={href}
        eventName="article_related_checklist_click"
        targetType="article"
        targetId={articleSlug}
        pagePath={`/articles/${articleSlug}`}
        metadata={{ slug: articleSlug, category, targetUrl: href }}
        className="mt-3 inline-flex w-full justify-center rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
      >
        チェックリストを見る
      </TrackedLink>
    </section>
  );
}
