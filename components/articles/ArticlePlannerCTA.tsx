import TrackedLink from "@/components/TrackedLink";

export default function ArticlePlannerCTA({
  articleSlug,
  category,
}: {
  articleSlug: string;
  category: string;
}) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50 p-3 md:p-4">
      <h2 className="text-lg font-bold text-gray-900">ライフプランナーで試す</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
        求人と物件を組み合わせて、生活費や帰国時点の残高を確認できます。
      </p>
      <TrackedLink
        href="/planner"
        eventName="planner_cta_click"
        targetType="article"
        targetId={articleSlug}
        pagePath={`/articles/${articleSlug}`}
        metadata={{ slug: articleSlug, category, targetUrl: "/planner" }}
        className="mt-3 inline-flex w-full justify-center rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
      >
        ライフプランナーを使う
      </TrackedLink>
    </section>
  );
}
